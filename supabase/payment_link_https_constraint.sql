-- Migration: add https constraint on payment_link + normalize empty strings to null
-- Applied: 2026-04-28
-- Constraint confirmed active in production (payment_link_must_be_https)

-- Normalize empty strings to NULL before applying constraint
UPDATE providers
SET payment_link = NULL
WHERE payment_link = '';

-- Add CHECK constraint: payment_link must be NULL or start with https://
ALTER TABLE providers
  ADD CONSTRAINT payment_link_must_be_https
  CHECK (payment_link IS NULL OR payment_link ~ '^https://');
