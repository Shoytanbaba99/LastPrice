-- HaggleArena Database Schema
-- Run: mysql -u root -p < database/schema.sql

CREATE DATABASE IF NOT EXISTS haggle_arena CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE haggle_arena;

-- ============================================================
-- Users Table
-- Every new user starts with 100 Trust Points.
-- If TP reaches 0, account is locked.
-- ============================================================
CREATE TABLE IF NOT EXISTS Users (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(50)  NOT NULL UNIQUE,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email)
) ENGINE=InnoDB;

-- ============================================================
-- Listings Table
-- reserve_floor is NEVER returned by any API endpoint.
-- display_price is shown publicly.
-- ============================================================
CREATE TABLE IF NOT EXISTS Listings (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  seller_id       BIGINT UNSIGNED NOT NULL,
  title           VARCHAR(255)   NOT NULL,
  description     TEXT,
  photo_url       VARCHAR(500),
  display_price   DECIMAL(10,2)  NOT NULL,
  reserve_floor   DECIMAL(10,2)  NOT NULL,  -- INTERNAL ONLY – never expose via API
  status          ENUM('draft', 'live', 'matched', 'unmatched', 'completed') NOT NULL DEFAULT 'draft',
  arena_end_time  DATETIME       NOT NULL,
  created_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (seller_id) REFERENCES Users(id) ON DELETE CASCADE,
  INDEX idx_status (status),
  INDEX idx_seller (seller_id),
  INDEX idx_arena_end (arena_end_time)
) ENGINE=InnoDB;

-- ============================================================
-- Bids Table
-- All bids stored; only Price Tension Indicator shown to buyers.
-- ============================================================
CREATE TABLE IF NOT EXISTS Bids (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  listing_id  BIGINT UNSIGNED NOT NULL,
  buyer_id    BIGINT UNSIGNED NOT NULL,
  amount      DECIMAL(10,2)  NOT NULL,
  created_at  DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (listing_id) REFERENCES Listings(id) ON DELETE CASCADE,
  FOREIGN KEY (buyer_id)   REFERENCES Users(id)    ON DELETE CASCADE,
  INDEX idx_listing (listing_id),
  INDEX idx_buyer  (buyer_id)
) ENGINE=InnoDB;



-- ============================================================
-- Transactions Table
-- Created after arena matches. Tracks deal confirmation.
-- ============================================================
CREATE TABLE IF NOT EXISTS Transactions (
  id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  listing_id   BIGINT UNSIGNED NOT NULL,
  buyer_id     BIGINT UNSIGNED NOT NULL,
  seller_id    BIGINT UNSIGNED NOT NULL,
  final_price  DECIMAL(10,2)  NOT NULL,
  status       ENUM('pending', 'confirmed') NOT NULL DEFAULT 'pending',
  created_at   DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (listing_id) REFERENCES Listings(id)  ON DELETE CASCADE,
  FOREIGN KEY (buyer_id)   REFERENCES Users(id)     ON DELETE CASCADE,
  FOREIGN KEY (seller_id)  REFERENCES Users(id)     ON DELETE CASCADE,
  INDEX idx_buyer  (buyer_id),
  INDEX idx_seller (seller_id),
  INDEX idx_status (status)
) ENGINE=InnoDB;
