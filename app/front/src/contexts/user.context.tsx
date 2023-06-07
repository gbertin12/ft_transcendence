import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/interfaces/chat.interfaces';
import { io, Socket } from 'socket.io-client';

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
			try {
				const response = await fetch('http://localhost:3000/user/me', { credentials: 'include' });
				const data = await response.json();
				setUser(data);
			} catch (error) {
				console.error(error);
			}
		};

		fetchUser();
	}, []);

	return (
		<UserContext.Provider value={{ user, setUser, socket }}>
			{children}
		</UserContext.Provider>
	);
};