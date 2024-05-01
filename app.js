const express = require('express');
const bodyParser = require('body-parser');
const { connectKafka } = require('./config/kafka');
const { connectRedis } = require('./config/redis');
const socketController = require('./controllers/socketController');
const authRouter = require('./controllers/authController'); 
const PORT = process.env.PORT || 4000;

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/api/', authRouter);

const server = require('http').createServer(app);
server.on('upgrade', function upgrade(request, socket, head) {
    socketController.handleUpgrade(request, socket, head, function done(ws) {
        socketController.emit('connection', ws, request);
    });
});

server.listen(PORT, async () => {
    console.log(`Server is listening on port: ${PORT}`);
    await connectKafka();
    await connectRedis();
});
