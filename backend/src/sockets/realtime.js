// src/sockets/realtime.js
module.exports = (io) => {
  const nsp = io.of("/realtime");

  nsp.on("connection", (socket) => {
    socket.on("join-shop", ({ shopId }) => {
      if (shopId) socket.join(`shop:${shopId}`);
    });
  });

  function broadcastOrderUpdate(shopId, payload) {
    nsp.to(`shop:${shopId}`).emit("order:update", payload);
  }

  return {
    broadcastOrderUpdate,
  };
};
