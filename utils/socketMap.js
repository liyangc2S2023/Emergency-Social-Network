class SocketMap {
  static instance;

  constructor() {
    this.socketMap = new Map();
  }

  addSocket(username, socket) {
    console.log('SMAP: add socket: ', username, socket.id);
    this.socketMap.set(username, socket);
  }

  getSocket(username) {
    return this.socketMap.get(username);
  }

  removeSocket(username) {
    this.socketMap.delete(username);
  }

  getSocketMap() {
    return this.socketMap;
  }

  static getInstance() {
    if (!SocketMap.instance) {
      SocketMap.instance = new SocketMap();
    }
    return SocketMap.instance;
  }
}

module.exports = SocketMap;
