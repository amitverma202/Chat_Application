const WebSocket = require('ws');
const socketController = require('../controllers/socketController');

describe('WebSocket Controller Tests', () => {
  let server;
  let client;

  beforeAll(() => {
    server = new WebSocket.Server({ noServer: true });
    server.on('connection', (ws) => {
    });
  });

  afterAll(() => {
    server.close();
  });

  test('WebSocket connection', (done) => {
    client = new WebSocket('ws://localhost:8080');

    client.on('open', () => {
      expect(client.readyState).toBe(WebSocket.OPEN);
      done();
    });

    client.on('error', (error) => {
      done.fail(error);
    });
  });

  test('WebSocket message exchange', (done) => {
    client = new WebSocket('ws://localhost:8080');

    client.on('open', () => {
      client.send('Hello, server!');
    });

    server.on('connection', (ws) => {
      ws.on('message', (message) => {
        expect(message).toBe('Hello, server!');
        done();
      });
    });

    client.on('error', (error) => {
      done.fail(error);
    });
  });

});
