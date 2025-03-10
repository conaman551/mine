export const establishWebSocketConnection = () => {
  const ws = new WebSocket('ws://3.26.72.199:8080');

   

  // Handle incoming messages
  ws.onmessage = (event) => {
    console.log(`Received message: ${event.data}`);
    // Handle the received message as required
  };

  // Handle connection open
  ws.onopen = () => {
    console.log('WebSocket connection established');
    // Perform any necessary actions when the connection is open
  };

  // Handle connection close
  ws.onclose = () => {
    console.log('WebSocket connection closed');
    // Perform any necessary actions when the connection is closed
  };

  // Handle connection errors
  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
    // Perform any necessary error handling
  }; 


  
// const sockClient = new WebSocket();

// sockClient.connect('ws://3.26.72.199:8080', 'echo-protocol');

// sockClient.on('connectFailed', function(error) {
//     console.log('Connect Error: ' + error.toString());
// });

// sockClient.on('connect', function(connection) {
//     console.log('WebSocket Client Connected');
//     connection.on('error', function(error) {
//         console.log("Connection Error: " + error.toString());
//     });
//     connection.on('close', function() {
//         console.log('echo-protocol Connection Closed');
//     });
//     connection.on('message', function(message) {
//         console.log(message);
//         /*if (message.type === 'message') {
//             console.log("Received: '" + message.message + "'");
//         }*/
//     });
  
//     connection.send(JSON.stringify({ type: 'join', room: 1 }));
//     connection.send(JSON.stringify({ type: 'message', user: "test user", message: "TESTING", room: 1 }));
//     // connection.send(JSON.stringify({ type: 'leave', room: 1 }));


// });






  // Return the WebSocket instance to allow interaction with it
  return ws;
};