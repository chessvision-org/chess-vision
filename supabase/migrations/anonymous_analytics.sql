-- ANONYMOUS ANALYTICS — DAILY AGGREGATE LOGS
-- PRIVACY: Only stores daily counts (numbers). No IPs, no hashes, no user identifiers.
-- The raw IP is hashed at Cloudflare edge, used for 24h deduplication, then discarded.
-- Supabase ONLY sees: date, visitors_count, export_users_count, cumulative totals.
-- Neither developer nor Supabase can ever identify individual users.

CREATE TABLE IF NOT EXISTS analytics_daily_logs (
  date DATE PRIMARY KEY,
  visitors BIGINT NOT NULL DEFAULT 0,
  export_users BIGINT NOT NULL DEFAULT 0,
  returning_visitors BIGINT,
  cumulative_visitors BIGINT NOT NULL DEFAULT 0,
  cumulative_export_users BIGINT NOT NULL DEFAULT 0,
  logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE analytics_daily_logs ENABLE ROW LEVEL SECURITY;

ALTER TABLE analytics_daily_logs
  ADD COLUMN IF NOT EXISTS returning_visitors BIGINT;

DROP FUNCTION IF EXISTS log_daily_analytics(DATE, BIGINT, BIGINT);
DROP FUNCTION IF EXISTS log_daily_analytics(DATE, BIGINT, BIGINT, BIGINT);
DROP FUNCTION IF EXISTS log_daily_analytics(DATE, BIGINT, BIGINT, BIGINT, BIGINT, BIGINT);

CREATE OR REPLACE FUNCTION log_daily_analytics(
  p_date DATE,
  p_visitors BIGINT,
  p_export_users BIGINT,
  p_returning_visitors BIGINT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cum_visitors BIGINT;
  cum_exports BIGINT;
BEGIN
  SELECT COALESCE(SUM(visitors), 0),
         COALESCE(SUM(export_users), 0)
  INTO cum_visitors, cum_exports
  FROM analytics_daily_logs
  WHERE date < p_date;

  cum_visitors := cum_visitors + p_visitors;
  cum_exports := cum_exports + p_export_users;

  INSERT INTO analytics_daily_logs (date, visitors, export_users, returning_visitors, cumulative_visitors, cumulative_export_users)
  VALUES (p_date, p_visitors, p_export_users, NULLIF(p_returning_visitors, 0), cum_visitors, cum_exports)
  ON CONFLICT (date) DO UPDATE SET
    visitors = EXCLUDED.visitors,
    export_users = EXCLUDED.export_users,
    returning_visitors = EXCLUDED.returning_visitors,
    cumulative_visitors = EXCLUDED.cumulative_visitors,
    cumulative_export_users = EXCLUDED.cumulative_export_users,
    logged_at = NOW();
END;
$$;

GRANT EXECUTE ON FUNCTION log_daily_analytics(DATE, BIGINT, BIGINT, BIGINT) TO service_role;

CREATE OR REPLACE VIEW analytics_summary AS
SELECT
  date,
  to_char(date, 'DD.MM.YYYY') AS date_display,
  visitors,
  export_users,
  returning_visitors,
  cumulative_visitors,
  cumulative_export_users
FROM analytics_daily_logs
ORDER BY date;

GRANT SELECT ON analytics_summary TO anon;