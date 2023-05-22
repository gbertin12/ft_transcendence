import React, { createContext, useContext } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket;
}

const SocketContext = createContext<SocketContextType>({
  socket: io('http://localhost:8001'),
});

export const useSocket = () => useContext(SocketContext);

export const SocketContextProvider: React.FC<any> = ({ children }) => {
  const socket = io('http://localhost:8001');

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};