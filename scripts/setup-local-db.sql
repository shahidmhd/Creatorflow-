-- Run through npm run db:setup:local so credentials come from the root .env.
\getenv app_user CONTENTREWARDS_DB_USER
\getenv app_password CONTENTREWARDS_DB_PASSWORD
\getenv app_database CONTENTREWARDS_DB_NAME

-- Existing roles keep their passwords and privileges.
SELECT format('CREATE ROLE %I LOGIN PASSWORD %L', :'app_user', :'app_password')
WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = :'app_user')
\gexec
\unset app_password

SELECT format('CREATE DATABASE %I OWNER %I', :'app_database', :'app_user')
WHERE NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = :'app_database')
\gexec
