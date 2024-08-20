const dotenv = require('dotenv');
dotenv.config({ path: './.env/config.env' });

const mongoose = require('mongoose');
const app = require('./app');
const http = require('http');
const socketio = require('socket.io');

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASS);

mongoose.connect(DB, { useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false })
  .then(() => console.log('DB connection successful'));

const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: '*',
  }
});

const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`App running on port ${port}...`);
});











// Socket.IO connection
io.on('connection', (socket) => {
  console.log('New WebSocket connection');

  socket.on('join', ({ username, room }) => {
    socket.join(room);
    socket.emit('message', { user: 'admin', text: `${username}, welcome to room ${room}.` });
    socket.broadcast.to(room).emit('message', { user: 'admin', text: `${username} has joined!` });
  });

  socket.on('sendMessage', (message, callback) => {
    const user = { name: 'User' }; // Mock user data
    io.to('room').emit('message', { user: user.name, text: message });

    callback();
  });

  socket.on('disconnect', () => {
    io.emit('message', { user: 'admin', text: 'A user has left.' });
  });
});
