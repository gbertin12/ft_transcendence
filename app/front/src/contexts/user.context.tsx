import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/interfaces/chat.interfaces';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';

interface UserContextType {
    user: User;
    setUser: React.Dispatch<React.SetStateAction<User>>;
    socket: Socket;
}

let socket: Socket = io('http://localhost:8001', { withCredentials: true });

const UserContext = createContext<UserContextType>({
user: {} as User,
    setUser: () => { },
    socket,
});

export const useUser = () => useContext(UserContext);

export const UserContextProvider: React.FC<any> = ({ children }) => {
    const [user, setUser] = useState<User>({} as User);

    useEffect(() => {
        const fetchUser = async () => {
        axios.get('http://localhost:3000/user/me',
                {
                    withCredentials: true,
                    validateStatus: () => true,
                })
                .then((response) => {
                    setUser(response.data);
            })
        };

        fetchUser();
    }, []);

    useEffect(() => {
        socket.on('updateUser', (user: User) => {
            setUser(user);
        });
    }, [socket]);

    return (
        <UserContext.Provider value={{ user, setUser, socket }}>
            {children}
        </UserContext.Provider>
    );
};
