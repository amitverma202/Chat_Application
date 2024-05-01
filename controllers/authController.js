const redis = require("redis");
const pool = require("../config/db");
const bcrypt = require("bcrypt");
const express = require("express");
const jwt = require("jsonwebtoken");

const router = express.Router();

const redisClient = redis.createClient();

redisClient.on("error", (error) => {
  console.error("Error connecting to Redis:", error);
});

const generateSecretKey = () => {
  const secretKeySize = 23;
  const char = "Aajgdgafgewufejfeguf87528edvhqjvd137dhvhqvefhveqjfvqefveqhfeqv";
  let secretKey = "";
  for (let i = 0; i < secretKeySize; i++) {
    const randomIndex = Math.floor(Math.random() * char.length);
    secretKey += char.charAt(randomIndex);
  }
  return secretKey;
};

router.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const pgClient = await pool.connect();
    const result = await pgClient.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    const user = result.rows[0];

    pgClient.release();

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    redisClient.set(email, user.id, (error, reply) => {
      if (error) {
        console.error("Error setting data in Redis:", error);
      } else {
        console.log("Redis set reply:", reply);
      }
    });

    const secretKey = generateSecretKey();
    const token = jwt.sign({ userId: user.id, email: user.email }, secretKey, {
      expiresIn: "1h",
    });

    res.status(200).json({ message: "Login successful", token: token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/auth/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res
      .status(400)
      .json({ error: "Username, email, and password are required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const pgClient = await pool.connect();
    const result = await pgClient.query(
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *",
      [username, email, hashedPassword]
    );
    const newUser = result.rows[0];
    pgClient.release();
    res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Internal Server Error" });
  }
});

router.delete("/auth/:username", async (req, res) => {
  const { username } = req.params;

  try {
    const pgClient = await pool.connect();
    const result = await pgClient.query(
      "DELETE FROM users WHERE username = $1 RETURNING *",
      [username]
    );
    const deletedUser = result.rows[0];
    pgClient.release();

    if (deletedUser) {
      res
        .status(200)
        .json({ message: "User deleted successfully", user: deletedUser });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/auth/", async (req, res) => {
  try {
    const pgClient = await pool.connect();
    const result = await pgClient.query("SELECT * FROM users");
    const users = result.rows;
    pgClient.release();
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
