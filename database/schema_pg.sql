CREATE TABLE IF NOT EXISTS Users (
  id            BIGSERIAL PRIMARY KEY,
  username      VARCHAR(50)  NOT NULL UNIQUE,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_email ON Users(email);

CREATE TABLE IF NOT EXISTS Listings (
  id              BIGSERIAL PRIMARY KEY,
  seller_id       BIGINT NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
  title           VARCHAR(255)   NOT NULL,
  description     TEXT,
  photo_url       VARCHAR(500),
  display_price   DECIMAL(10,2)  NOT NULL,
  reserve_floor   DECIMAL(10,2)  NOT NULL,
  status          VARCHAR(50) NOT NULL DEFAULT 'draft',
  arena_end_time  TIMESTAMP       NOT NULL,
  created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_status ON Listings(status);
CREATE INDEX idx_seller ON Listings(seller_id);
CREATE INDEX idx_arena_end ON Listings(arena_end_time);

CREATE TABLE IF NOT EXISTS Bids (
  id          BIGSERIAL PRIMARY KEY,
  listing_id  BIGINT NOT NULL REFERENCES Listings(id) ON DELETE CASCADE,
  buyer_id    BIGINT NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
  amount      DECIMAL(10,2)  NOT NULL,
  created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_listing ON Bids(listing_id);
CREATE INDEX idx_buyer ON Bids(buyer_id);

CREATE TABLE IF NOT EXISTS Transactions (
  id           BIGSERIAL PRIMARY KEY,
  listing_id   BIGINT NOT NULL REFERENCES Listings(id)  ON DELETE CASCADE,
  buyer_id     BIGINT NOT NULL REFERENCES Users(id)     ON DELETE CASCADE,
  seller_id    BIGINT NOT NULL REFERENCES Users(id)     ON DELETE CASCADE,
  final_price  DECIMAL(10,2)  NOT NULL,
  status       VARCHAR(50) NOT NULL DEFAULT 'pending',
  created_at   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_tx_buyer ON Transactions(buyer_id);
CREATE INDEX idx_tx_seller ON Transactions(seller_id);
CREATE INDEX idx_tx_status ON Transactions(status);
