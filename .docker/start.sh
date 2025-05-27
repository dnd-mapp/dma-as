#!/bin/sh

set -e

ROOT_PASSWORD=$(cat /run/secrets/mariadb-root-password)
USER_PASSWORD=$(cat /run/secrets/mariadb-user-password)

echo "Creating initial DB Users and Table"

mariadb -u root -p"$ROOT_PASSWORD" <<-EOSQL
    CREATE DATABASE IF NOT EXISTS dnd_mapp_auth_db;

    CREATE USER IF NOT EXISTS 'dnd_mapp_auth_db_user'@'%' IDENTIFIED BY '$USER_PASSWORD';
    GRANT ALL PRIVILEGES ON dnd_mapp_auth_db.* TO 'dnd_mapp_auth_db_user'@'%';
    FLUSH PRIVILEGES;
EOSQL

echo "Initial DB Users and privileges have been created and assigned"
