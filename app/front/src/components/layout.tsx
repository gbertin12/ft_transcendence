import utilStyles from '../styles/utils.module.css';
import Navbar from './navbar'
import { useEffect } from 'react';
import { useUser } from '@/contexts/user.context';
import { PlayerInterface } from '@/interfaces/pong.interface';
import NotifContainer from './pong/NotifContainer';
import { useNotif } from '@/contexts/notif.context';
import { useRouter } from 'next/router';

export default function Layout({ children }) {
    const { socket } = useUser();
    const { setOpponent, showNotif, setShowNotif, roomName, setRoomName, setWho } = useNotif();
    const router = useRouter();

    useEffect(() => {
        socket.on('duelRequest', (opponent: PlayerInterface) => {
            setShowNotif(true);
            setOpponent(opponent);
        });

        socket.on('searchGameDuel', ({ roomname, who }: { roomname: string, who: number }) => {
            setShowNotif(false);
            router.push(`/game?roomName=${roomname}&who=${who}`);
        });
    }, [socket]);

    return (
        <>
            <Navbar/>
            {(showNotif) && (<NotifContainer/>)}
            <main>{children}</main>
        </>
    );
}
