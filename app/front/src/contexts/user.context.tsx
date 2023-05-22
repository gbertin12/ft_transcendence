import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/interfaces/chat.interfaces';

interface UserContextType {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
}

const UserContext = createContext<UserContextType>({
  user: {} as User,
  setUser: () => {},
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
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};