-- Randomize reported_at over the last 14 days for all existing records
UPDATE lab_results
SET reported_at = NOW() - (random() * 14 * 24 * 60 || ' minutes')::interval;

-- Set collected_at to be 15 to 60 minutes before reported_at
UPDATE lab_results
SET collected_at = reported_at - (15 + random() * 45 || ' minutes')::interval;
