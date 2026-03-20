const { Server } = require('socket.io')

require('dotenv').config();
let io;


const allowedOrigins = process.env.ALLOWED_ORIGINS.split(",");


 function initSocket(server) {
  io = new Server(server, {
    cors: { origin: allowedOrigins },
    path: "/api-collect/socket",
  });


  // debugging existing socket connections

    io.on("connection", (socket) => {
    console.log("🔌 New connection:", socket.id);
    console.log("👥 Active connections:", io.engine.clientsCount);

    console.log(
      "📦 Active socket IDs:",
      [...io.sockets.sockets.keys()]
    );

    socket.on("disconnect", (reason) => {
      console.log("❌ Disconnected:", socket.id, reason);
      console.log("👥 Active connections:", io.engine.clientsCount);
    });
  });

  
  return io;
}

function getIO() {
  if (!io) throw new Error('Socket not initialized');
  return io;
}


module.exports = {initSocket,getIO}