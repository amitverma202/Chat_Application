const WebSocket = require('ws'); 
const pool = require('../config/db');
const { publishToKafka } = require('../config/kafka'); 

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', function connection(ws) {
    console.log('New Client/User Connected from one console');

    pool.query('SELECT message FROM messages', (err, result) => {
        if (err) {
            console.error('Error fetching messages from database:', err);
        } else {
            result.rows.forEach(function(row) {
                ws.send(row.message);
            });
        }
    });

    ws.on('message', async function incoming(message) {
        console.log('Received: %s', message);

        wss.clients.forEach(function each(client) {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });

        try {
            const clientDb = await pool.connect();
            const result = await clientDb.query('INSERT INTO messages (message) VALUES ($1) RETURNING *', [message]); 
            const newMessage = result.rows[0]; 
            clientDb.release(); 
            console.log('Msg stored in DB:', newMessage);
        } catch (error) {
            console.error('Error storing msg in DB:', error);
        }

        await publishToKafka(message);
    });

    ws.on('close', () => {
        console.log('Client/User disconnected from one console');
    });
});
