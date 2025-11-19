-- Crear usuario gbloomer con permisos desde cualquier host
CREATE DATABASE IF NOT EXISTS bitnet;
CREATE USER IF NOT EXISTS 'bitnet'@'%' IDENTIFIED BY 'bitnet123';
CREATE USER IF NOT EXISTS 'bitnet'@'localhost' IDENTIFIED BY 'bi';
GRANT select, insert, delete, update ON bitnet.* TO 'bitnet'@'%';
GRANT ALL PRIVILEGES ON bitnet.* TO 'bitnet'@'localhost';

FLUSH PRIVILEGES;