CREATE TABLE audit_logs (
    id          BIGSERIAL PRIMARY KEY,
    request_id  VARCHAR(100),
    user_id     BIGINT REFERENCES users(id),
    action      VARCHAR(100) NOT NULL,     -- LIST_RESULTS | VIEW_RESULT | REQUEST_LLM | LOGIN | INGEST_RESULT
    entity_type VARCHAR(100),
    entity_id   VARCHAR(100),
    detail      TEXT,
    ip_address  VARCHAR(50),
    created_at  TIMESTAMPTZ DEFAULT NOW()
);
