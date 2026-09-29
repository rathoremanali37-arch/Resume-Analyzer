export interface AnalysisResult {
  overall_score: number;
  keyword_score: number;
  format_score: number;
  impact_score: number;
  summary: string;
  suggestions: { title: string; detail: string; severity: 'high' | 'medium' | 'low' }[];
  matched_keywords: string[];
  missing_keywords: string[];
  grammar_issues: { issue: string; suggestion: string; context: string }[];
  weak_phrases: { phrase: string; count: number; alternatives: string[] }[];
  section_breakdown: { name: string; present: boolean }[];
  word_count: number;
  ideal_length: boolean;
  passive_sentences: { sentence: string; suggestion: string }[];
  buzzwords: { word: string; count: number }[];
  contact_validation: {
    email: { value: string; valid: boolean; status: 'valid' | 'invalid' | 'missing' };
    phone: { value: string; valid: boolean; status: 'valid' | 'invalid' | 'missing' };
    linkedin: { value: string; valid: boolean; status: 'valid' | 'invalid' | 'missing' };
  };
}

export interface ScoreSet {
  overall_score: number;
  keyword_score: number;
  format_score: number;
  impact_score: number;
}

export interface ResumeAnalysis extends AnalysisResult {
  id: string;
  user_id: string;
  resume_text: string;
  job_description: string | null;
  created_at: string;
  previous_scores: ScoreSet | null;
}
