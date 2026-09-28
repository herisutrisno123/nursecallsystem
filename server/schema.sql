-- Skema database Lisensi Nursecall Monitor (opsional, dibuat otomatis oleh server)
CREATE DATABASE IF NOT EXISTS nursecall_lisensi CHARACTER SET utf8mb4;
USE nursecall_lisensi;

CREATE TABLE IF NOT EXISTS clients (
  id VARCHAR(40) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255) NOT NULL DEFAULT '',
  email VARCHAR(255) NOT NULL DEFAULT '',
  phone VARCHAR(100) NOT NULL DEFAULT '',
  address VARCHAR(500) NOT NULL DEFAULT '',
  city VARCHAR(150) NOT NULL DEFAULT '',
  npwp VARCHAR(50) NOT NULL DEFAULT '',
  created_at DATE NULL,
  notes TEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS licenses (
  id VARCHAR(40) PRIMARY KEY,
  license_key VARCHAR(40) NOT NULL UNIQUE,
  client_id VARCHAR(40) NOT NULL,
  customer_name VARCHAR(255) NOT NULL DEFAULT '',
  customer_id VARCHAR(80) NOT NULL DEFAULT '',
  ward_count INT NOT NULL DEFAULT 0,
  plan VARCHAR(30) NOT NULL DEFAULT 'standard',
  max_devices INT NOT NULL DEFAULT 1,
  max_users INT NOT NULL DEFAULT 1,
  issue_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  activated_at DATE NULL,
  notes TEXT NULL,
  INDEX idx_client (client_id),
  CONSTRAINT fk_licenses_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
