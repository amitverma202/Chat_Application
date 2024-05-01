const request = require('supertest');
const express = require('express');
const authController = require('../controllers/authController');

const app = express();

app.use('/api/auth', authController);

describe('Authentication Controller Tests', () => {
  test('Login with valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@example.com', password: 'password' });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('token');
  });

  test('Register new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ username: 'newuser', email: 'newuser@example.com', password: 'newpassword' });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.username).toBe('newuser');
    expect(response.body.email).toBe('newuser@example.com');
  });

  test('Login with invalid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'invalid@example.com', password: 'invalidpassword' });

    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty('error');
  });

  test('Get all users', async () => {
    const response = await request(app)
      .get('/api/auth');

    expect(response.statusCode).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
  });
});
