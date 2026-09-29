/*
# Add passive voice, buzzword, contact validation, and previous score columns

## Overview
Extends resume_analyses to store four new analysis dimensions so the dashboard
can render passive-voice sentences, buzzword/cliché hits, contact-info
validation results, and a before/after score comparison.

## Modified Tables
- `resume_analyses`
  - `passive_sentences` (jsonb, array of { sentence, suggestion }) — default '[]'
  - `buzzwords` (jsonb, array of { word, count }) — default '[]'
  - `contact_validation` (jsonb, object with email/phone/linkedin results) — default '{}'
  - `previous_scores` (jsonb, object with overall/keyword/format/impact from the
    user's previous analysis, used for before/after comparison) — default null

## Security
- No RLS policy changes. Existing owner-scoped policies cover the new columns.
- All new columns have safe defaults so existing rows are not affected.
*/

ALTER TABLE resume_analyses
  ADD COLUMN IF NOT EXISTS passive_sentences jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS buzzwords jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS contact_validation jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS previous_scores jsonb DEFAULT NULL;
