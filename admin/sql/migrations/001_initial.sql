-- Initial admin schema (idempotent for re-runs / existing installs).
CREATE TABLE IF NOT EXISTS projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(64) NOT NULL UNIQUE,
  status ENUM('production', 'concept') NOT NULL DEFAULT 'concept',
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  display_order INT NOT NULL DEFAULT 0,
  name_fa VARCHAR(120) NOT NULL,
  name_en VARCHAR(120) NOT NULL,
  subtitle_fa VARCHAR(255),
  subtitle_en VARCHAR(255),
  desc_fa TEXT,
  desc_en TEXT,
  problem_fa TEXT,
  problem_en TEXT,
  approach_fa TEXT,
  approach_en TEXT,
  result_fa TEXT,
  result_en TEXT,
  role_fa JSON,
  role_en JSON,
  tech JSON,
  tags JSON,
  image_url VARCHAR(500),
  mock VARCHAR(32) NULL,
  caps_fa JSON NULL,
  caps_en JSON NULL,
  published_sha VARCHAR(64),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(64) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS login_attempts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(64) NOT NULL,
  ip_address VARCHAR(45) NOT NULL,
  attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  success BOOLEAN NOT NULL
);

-- Index may already exist on upgraded installs; ignore duplicate-name errors via procedure-free note:
-- Prefer CREATE INDEX IF NOT EXISTS where MySQL version supports it (8.0+).
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip_time ON login_attempts (ip_address, attempted_at);
