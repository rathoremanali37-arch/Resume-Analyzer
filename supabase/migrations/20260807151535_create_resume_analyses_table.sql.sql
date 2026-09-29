/*
# Create resume_analyses table

## Overview
Stores AI analysis results for resumes submitted by authenticated users.
Each user sees only their own analyses.

## New Tables
- `resume_analyses`
  - `id` (uuid, primary key)
  - `user_id` (uuid, owner, defaults to auth.uid(), FK to auth.users)
  - `resume_text` (text, the pasted/extracted resume content)
  - `job_description` (text, the target job description, nullable)
  - `overall_score` (int, 0-100, the ATS compatibility score)
  - `keyword_score` (int, 0-100)
  - `format_score` (int, 0-100)
  - `impact_score` (int, 0-100)
  - `summary` (text, AI-generated summary)
  - `suggestions` (jsonb, array of suggestion objects)
  - `matched_keywords` (jsonb, array of strings)
  - `missing_keywords` (jsonb, array of strings)
  - `created_at` (timestamptz, default now())

## Security
- Enable RLS on resume_analyses.
- Owner-scoped CRUD: each authenticated user can only access rows they own.
- 4 policies: select, insert, update, delete — all scoped to authenticated with auth.uid() = user_id.
*/

CREATE TABLE IF NOT EXISTS resume_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  resume_text text NOT NULL,
  job_description text,
  overall_score int NOT NULL DEFAULT 0 CHECK (overall_score >= 0 AND overall_score <= 100),
  keyword_score int NOT NULL DEFAULT 0 CHECK (keyword_score >= 0 AND keyword_score <= 100),
  format_score int NOT NULL DEFAULT 0 CHECK (format_score >= 0 AND format_score <= 100),
  impact_score int NOT NULL DEFAULT 0 CHECK (impact_score >= 0 AND impact_score <= 100),
  summary text NOT NULL DEFAULT '',
  suggestions jsonb NOT NULL DEFAULT '[]'::jsonb,
  matched_keywords jsonb NOT NULL DEFAULT '[]'::jsonb,
  missing_keywords jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE resume_analyses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_analyses" ON resume_analyses;
CREATE POLICY "select_own_analyses"
  ON resume_analyses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_analyses" ON resume_analyses;
CREATE POLICY "insert_own_analyses"
  ON resume_analyses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_analyses" ON resume_analyses;
CREATE POLICY "update_own_analyses"
  ON resume_analyses FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_analyses" ON resume_analyses;
CREATE POLICY "delete_own_analyses"
  ON resume_analyses FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_resume_analyses_user_id ON resume_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_resume_analyses_created_at ON resume_analyses(created_at DESC);
