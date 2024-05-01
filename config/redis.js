const redis = require('redis');

function connectRedis() {
    const client = redis.createClient();

    client.on('connect', function () {
        console.log('Redis client connected');
    });

    client.on('error', function (err) {
        console.error('Error occurred in Redis client:', err);
    });

    return client;
}

module.exports = { connectRedis };
