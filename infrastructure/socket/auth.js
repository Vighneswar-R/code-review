
const jwt = require('jsonwebtoken')

 function attachSocketAuth(io) {
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Unauthorized'));

      const user = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = user;

      socket.join(`user:${user.id}`);
      socket.join(`role:${user.role}`);

      next();
    } catch (e) {
      next(e);
    }
  });
}


module.exports = {attachSocketAuth}
