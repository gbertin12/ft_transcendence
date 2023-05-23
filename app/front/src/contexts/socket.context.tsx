import React, { createContext, useContext, useMemo } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket;
}

let socket: Socket = io('http://localhost:8001', { withCredentials: true });

const SocketContext = createContext<SocketContextType>({
  socket,
});

export const useSocket = () => useContext(SocketContext);

export const SocketContextProvider: React.FC<any> = ({ children }) => {
  const socketValue = useMemo(() => ({ socket }), [socket]);
  return <SocketContext.Provider value={socketValue}>{children}</SocketContext.Provider>;
}