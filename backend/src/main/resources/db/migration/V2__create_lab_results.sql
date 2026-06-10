CREATE TABLE lab_results (
    id              BIGSERIAL PRIMARY KEY,
    device_id       VARCHAR(100),
    device_model    VARCHAR(200),
    result_id       VARCHAR(100) UNIQUE NOT NULL,  -- UUID from device
    patient_ref     VARCHAR(100),
    patient_age     INTEGER,
    patient_gender  VARCHAR(10),
    test_code       VARCHAR(50) NOT NULL,
    test_name       VARCHAR(200),
    value           NUMERIC(12,4),
    unit            VARCHAR(50),
    reference_min   NUMERIC(12,4),
    reference_max   NUMERIC(12,4),
    severity        VARCHAR(50),            -- NORMAL | LOW | HIGH | CRITICAL_LOW | CRITICAL_HIGH
    collected_at    TIMESTAMPTZ,
    reported_at     TIMESTAMPTZ,
    ingested_at     TIMESTAMPTZ DEFAULT NOW(),
    raw_payload     TEXT,                   -- stores raw JSON string
    validation_error VARCHAR(500),          -- validation messages if malformed
    status          VARCHAR(50) DEFAULT 'RECEIVED' -- RECEIVED | VALIDATED | INVALID
);
