import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

function errorResponse(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function extractTextFromPdf(fileBytes: Uint8Array): Promise<string> {
  const { default: pdfParse } = await import("npm:pdf-parse@1.1.1");
  const buffer = fileBytes instanceof ArrayBuffer
    ? fileBytes
    : fileBytes.buffer.slice(fileBytes.byteOffset, fileBytes.byteOffset + fileBytes.byteLength);
  const data = await pdfParse(buffer as ArrayBuffer);
  return data.text ?? "";
}

async function extractTextFromDocx(fileBytes: Uint8Array): Promise<string> {
  const mammoth = await import("npm:mammoth@1.8.0");
  const buffer = fileBytes instanceof ArrayBuffer
    ? fileBytes
    : fileBytes.buffer.slice(fileBytes.byteOffset, fileBytes.byteOffset + fileBytes.byteLength);
  const result = await mammoth.extractRawText({ buffer: buffer as ArrayBuffer });
  return result.value ?? "";
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return errorResponse("Method not allowed. Use POST.", 405);
  }

  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) {
    return errorResponse("Missing or invalid Authorization header.", 401);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const token = authHeader.replace("Bearer ", "");
  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData.user) {
    return errorResponse("Authentication failed.", 401);
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return errorResponse("Expected multipart/form-data with a 'file' field.", 400);
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return errorResponse("No file uploaded. Include a 'file' field in the form data.", 400);
  }

  const fileName = file.name.toLowerCase();
  const isPdf = fileName.endsWith(".pdf") || file.type === "application/pdf";
  const isDocx =
    fileName.endsWith(".docx") ||
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

  if (!isPdf && !isDocx) {
    return errorResponse("Unsupported file type. Only PDF and DOCX files are accepted.", 415);
  }
  if (!ALLOWED_TYPES.includes(file.type) && !isPdf && !isDocx) {
    return errorResponse("Unsupported file type. Only PDF and DOCX files are accepted.", 415);
  }
  if (file.size > MAX_FILE_SIZE) {
    return errorResponse("File is too large. Maximum size is 5 MB.", 413);
  }
  if (file.size === 0) {
    return errorResponse("The uploaded file is empty.", 400);
  }

  const arrayBuffer = await file.arrayBuffer();
  const fileBytes = new Uint8Array(arrayBuffer);

  try {
    let extractedText = "";
    if (isPdf) {
      extractedText = await extractTextFromPdf(arrayBuffer);
    } else {
      extractedText = await extractTextFromDocx(arrayBuffer);
    }

    const trimmed = extractedText.trim();
    if (trimmed.length < 20) {
      return errorResponse(
        "Could not extract enough text from this file. It may be a scanned image or corrupted.",
        422,
      );
    }

    return new Response(
      JSON.stringify({
        text: trimmed,
        file_name: file.name,
        file_size: file.size,
        file_type: isPdf ? "pdf" : "docx",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to parse the uploaded file.";
    return errorResponse(message, 500);
  }
});
