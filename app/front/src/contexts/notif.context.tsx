import React, { createContext, useContext, useState } from 'react';
import { PlayerInterface } from '@/interfaces/pong.interface';

interface NotifContextType {
    showNotif: boolean;
    setShowNotif: React.Dispatch<React.SetStateAction<boolean>>;
    opponent: PlayerInterface,
    setOpponent: React.Dispatch<React.SetStateAction<PlayerInterface>>;
    roomName: string;
    setRoomName: React.Dispatch<React.SetStateAction<string>>;
    who: number;
    setWho: React.Dispatch<React.SetStateAction<number>>;
    canRequest: boolean;
    setCanRequest: React.Dispatch<React.SetStateAction<boolean>>;
}

const NotifContext = createContext<NotifContextType>({
    showNotif: true,
    setShowNotif: () => {},
    opponent: {} as PlayerInterface,
    setOpponent: () => {},
    roomName: "",
    setRoomName: () => {},
    who: 0,
    setWho: () => {},
    canRequest: true,
    setCanRequest: () => {},
});

export const useNotif = () => useContext(NotifContext);

export const NotifContextProvider: React.FC<any> = ({ children }) => {
    const [ showNotif, setShowNotif ] = useState<boolean>(false);
    const [ opponent, setOpponent ] = useState<PlayerInterface>({} as PlayerInterface);
    const [ roomName, setRoomName ] = useState<string>("");
    const [ who, setWho ] = useState<number>(0);
    const [ canRequest, setCanRequest ] = useState<boolean>(true);

    return (
        <NotifContext.Provider value={{ showNotif, setShowNotif, opponent, setOpponent, roomName, setRoomName, who, setWho, canRequest, setCanRequest }}>
            {children}
        </NotifContext.Provider>
    );
};
