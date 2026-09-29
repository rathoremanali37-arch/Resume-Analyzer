/*
# Add detailed analysis columns to resume_analyses

## Overview
Extends the resume_analyses table to store richer analysis output so the
dashboard can render grammar issues, weak-phrase feedback, section
presence breakdown, and resume length stats alongside the existing scores.

## Modified Tables
- `resume_analyses`
  - `grammar_issues` (jsonb, array of { issue, suggestion, context }) — default '[]'
  - `weak_phrases`   (jsonb, array of { phrase, count, alternatives }) — default '[]'
  - `section_breakdown` (jsonb, array of { name, present }) — default '[]'
  - `word_count` (int, number of words in the resume text) — default 0
  - `ideal_length` (boolean, whether word count is within 400-800) — default false

## Security
- No RLS policy changes. Existing owner-scoped policies cover the new columns.
- All new columns have safe defaults so existing rows are not affected.
*/

ALTER TABLE resume_analyses
  ADD COLUMN IF NOT EXISTS grammar_issues jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS weak_phrases jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS section_breakdown jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS word_count int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ideal_length boolean NOT NULL DEFAULT false;
