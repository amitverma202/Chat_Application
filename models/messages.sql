-- 1. Create Database by below command

-- CREATE DATABASE chatapplication;

-- 2. Create table by below command

   CREATE TABLE messages (
     id SERIAL PRIMARY KEY,
     message TEXT NOT NULL,
     timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

