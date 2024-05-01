
-- 1. Create Database by below command

-- CREATE DATABASE chatapplication;

-- 2. Create table by below command
   CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
   );