const express = require('express')
const app = express()
const { wss } = require('./webSocketServer')
const {deleteOldRecords} = require('./databaseCleaner')
const userRouter = require('./routes/users')
const filterRouter = require('./routes/filters')
const imagesRouter = require('./routes/images')
const authRouter = require('./routes/auth')
const fs = require('fs');
const https = require('https');
const userSettingsRouter = require('./routes/userSettings')
const port = 3000;

//app.use(express.json());
const chatsRouter = require('./routes/chats')

// WebSocket Config
const server = https.createServer({
    key: fs.readFileSync('/etc/letsencrypt/live/trippr.org/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/trippr.org/fullchain.pem')
  }, app);

//deleteOldRecords();
//setInterval(deleteOldRecords(), 60 * 1000);

/*setTimeout(() => {
    deleteOldRecords();
    setInterval(deleteOldRecords, 24 * 60 * 60 * 1000); // Repeat every 24 hours
}, 1000);*/

app.use(express.json({limit: '200mb'}));
app.use(express.urlencoded({limit: '200mb', extended: true}));

// app.use(express.json())
app.use('/auth',authRouter)
app.use('/users', userRouter)
app.use('/userSettings', userSettingsRouter)
app.use('/filters', filterRouter)
app.use('/chats', chatsRouter)
app.use('/images', imagesRouter)


server.listen(port, () => {
    console.log(`Server is running on https://localhost:${port}`);
  });

