const { WebSocketServer } = require('ws');
const wss = new WebSocketServer({ port: 8080, host: '0.0.0.0' });

const db = require('./database_connector/databaseConnection');
const createSubscriber = require("pg-listen")

const rooms = {};


// Accepts the same connection config object that the "pg" package would take
const subscriber = createSubscriber({
  user: process.env.user,
      password: process.env.password,
      port: process.env.dbport,
      host: process.env.dbhost,
      database: process.env.database
});

subscriber.notifications.on("table_update", (payload) => {
  // Payload as passed to subscriber.notify() (see below)
  console.log("Received notification in 'table_update':", payload)
});

subscriber.events.on("error", (error) => {
  console.error("Fatal database connection error:", error)
  process.exit(1)
});

subscriber.events.on("connected", () => {
console.log("Connected successfully");
});

process.on("exit", () => {
  subscriber.close()
});

const init_rooms = async () => {
try {

		const result = await db.client.query(`
			SELECT "Chat_id"
			FROM "CHAT"
			`)
	for (row in result.rows) {
		console.log(result.rows[row]);
	rooms[result.rows[row].Chat_id] = new Set();
	console.log(rooms);
};
	} catch (err) {
		console.error('Error getting chat list for user', err);
	}
}

init_rooms();


subscriber.connect().then(() => {
    subscriber.listenTo('table_update');
    subscriber.notifications.on('table_update', (payload) => {
        console.log(`Received update: ${payload}`);
	if (payload != null) {
		console.log(payload.Chat_id);
		rooms[payload.Chat_id] = new Set();
	}
    });
});

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        const parsedMessage = JSON.parse(message);

        if (parsedMessage.type === 'join') {
            // Join a room
            const room = parsedMessage.room;
		console.log(room);
            rooms[room].add(ws);
            ws.send(JSON.stringify({ type: 'joined', room: parsedMessage.room }));
	//console.log(rooms);
        } else if (parsedMessage.type === 'message') {
            // Broadcast a message to the room
            const broadcastMessage = JSON.stringify({
                type: 'message',
                user: parsedMessage.user,
                message: parsedMessage.message,
	            	room: parsedMessage.room,
            });

		//console.log(rooms[parsedMessage.room]);
            rooms[parsedMessage.room].forEach(Client => {
                //if (ws.readyState === WebSocketServer.OPEN) {
                    //client.send(parsedMessage.message);
            	Client.send(JSON.stringify({type: 'message', uid: parsedMessage.user, message: parsedMessage.message }));
                //}
            });
		console.log("received message from room: " + parsedMessage.room.toString() + parsedMessage.message);
        } else if (parsedMessage.type === "leave") {
		const room = parsedMessage.room;
		rooms[room].delete(ws);
		ws.send(JSON.stringify({ type: 'left', room}));
		console.log(room);
	}
    });

    /*ws.on('close', () => {
        if (currentRoom && rooms[currentRoom]) {
            rooms[currentRoom].delete(ws);
            if (rooms[currentRoom].size === 0) {
                delete rooms[currentRoom];
            }
        }
    });*/

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});

module.exports = {
	wss
}

// Function to print a message
/*function printMessage() {
  console.log(``);
for (row in rooms) {
	console.log(rooms[row].size);
};
}

// Print the message every second (1000 milliseconds)
const interval = 1000; // 1 second

// Set up the interval to call printMessage every second
const intervalId = setInterval(printMessage, interval);
*/

/*
sockServer.on('connection', ws => {
  console.log('Client has connected');

  ws.send('connection established');
  sockServer.clients.forEach((client) => {
	console.log(client);
  });

  ws.on('close', () => console.log('Client has disconnected'));

  ws.on('message', data => {
    sockServer.clients.forEach(client => {
      console.log(`distributing message: ${data}`);
      client.send(`${data}`);
    })
  });

  ws.onerror = function () {
    console.log('websocket error');
  }
})*/
