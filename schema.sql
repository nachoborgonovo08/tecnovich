-- Sistema de Reservas - Gestión de Materiales
-- Esquema de base de datos MySQL

CREATE DATABASE IF NOT EXISTS sistema_reservas
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE sistema_reservas;

-- ── Usuarios ──
CREATE TABLE IF NOT EXISTS usuarios (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  usuario     VARCHAR(40)  NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,           -- guardar con password_hash() en PHP
  nombre      VARCHAR(120) NOT NULL,
  rol         ENUM('Docente','Coordinador') NOT NULL DEFAULT 'Docente',
  creado_en   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── Materiales (categorías de items) ──
CREATE TABLE IF NOT EXISTS materiales (
  clave       VARCHAR(30)  PRIMARY KEY,
  nombre      VARCHAR(120) NOT NULL,
  total       INT NOT NULL DEFAULT 0,
  capacidad   INT NULL,                        -- solo para talleres (personas)
  activo      TINYINT(1) NOT NULL DEFAULT 1,
  actualizado TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ── Reservas ──
CREATE TABLE IF NOT EXISTS reservas (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  usuario       VARCHAR(40)  NOT NULL,
  item          VARCHAR(30)  NOT NULL,
  cantidad      INT NOT NULL DEFAULT 1,
  fecha         DATE NOT NULL,
  observaciones VARCHAR(255) DEFAULT NULL,
  creado_en     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_resv_item    FOREIGN KEY (item)    REFERENCES materiales(clave) ON UPDATE CASCADE,
  CONSTRAINT fk_resv_usuario FOREIGN KEY (usuario) REFERENCES usuarios(usuario) ON UPDATE CASCADE,
  INDEX idx_resv_fecha (fecha),
  INDEX idx_resv_item_fecha (item, fecha)
);

-- ── Datos iniciales ──
INSERT INTO usuarios (usuario, password, nombre, rol) VALUES
  ('docente1',     '$2y$10$DEMO_HASH_REPLACE', 'María González', 'Docente'),
  ('coordinador1', '$2y$10$DEMO_HASH_REPLACE', 'Carlos Pérez',   'Coordinador')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

INSERT INTO materiales (clave, nombre, total, capacidad) VALUES
  ('portatiles',  'Computadoras Portátiles', 20, NULL),
  ('routers',     'Routers WiFi',            10, NULL),
  ('proyectores', 'Proyectores',              8, NULL),
  ('tallerA',     'Taller de Informática A',  1, 30),
  ('tallerB',     'Taller de Informática B',  1, 25)
ON DUPLICATE KEY UPDATE
  nombre    = VALUES(nombre),
  total     = VALUES(total),
  capacidad = VALUES(capacidad);

-- ── Vista de utilidad: disponibilidad por item para hoy ──
CREATE OR REPLACE VIEW v_disponibilidad_hoy AS
SELECT m.clave, m.nombre, m.total,
       COALESCE(SUM(r.cantidad), 0) AS usados,
       m.total - COALESCE(SUM(r.cantidad), 0) AS libres
FROM materiales m
LEFT JOIN reservas r ON r.item = m.clave AND r.fecha = CURDATE()
GROUP BY m.clave, m.nombre, m.total;
