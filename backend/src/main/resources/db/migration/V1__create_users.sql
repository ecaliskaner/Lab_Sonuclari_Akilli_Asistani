CREATE TABLE users (
    id          BIGSERIAL PRIMARY KEY,
    email       VARCHAR(255) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,     -- BCrypt hash
    full_name   VARCHAR(255) NOT NULL,
    role        VARCHAR(50)  NOT NULL,     -- DOCTOR | ADMIN
    active      BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);
