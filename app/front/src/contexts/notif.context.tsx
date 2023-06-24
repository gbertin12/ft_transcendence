import React, { createContext, useContext, useState } from 'react';
import { PlayerInterface } from '@/interfaces/pong.interface';

interface NotifContextType {
    showNotif: boolean;
    setShowNotif: React.Dispatch<React.SetStateAction<boolean>>;
    opponent: PlayerInterface,
    setOpponent: React.Dispatch<React.SetStateAction<PlayerInterface>>;
}

const NotifContext = createContext<NotifContextType>({
    showNotif: true,
    setShowNotif: () => {},
    opponent: {} as PlayerInterface,
    setOpponent: () => {},
});

export const useNotif = () => useContext(NotifContext);

export const NotifContextProvider: React.FC<any> = ({ children }) => {
    const [ showNotif, setShowNotif ] = useState<boolean>(false);
    const [ opponent, setOpponent ] = useState<PlayerInterface>({} as PlayerInterface);

    return (
        <NotifContext.Provider value={{ showNotif, setShowNotif, opponent, setOpponent }}>
            {children}
        </NotifContext.Provider>
    );
};
