import utilStyles from '../styles/utils.module.css';
import Navbar from './navbar'
import { useEffect, useState } from 'react';
import { useUser } from '@/contexts/user.context';
import { PlayerInterface } from '@/interfaces/pong.interface';
import NotifContainer from './pong/NotifContainer';
import { useNotif } from '@/contexts/notif.context';
import { useRouter } from 'next/router';

export default function Layout({ children }: any) {
    const [ decline, setDecline ] = useState<boolean>(false);

    const { socket } = useUser();
    const { setOpponent, showNotif, setShowNotif } = useNotif();
    const router = useRouter();

    useEffect(() => {
        socket.on('duelRequest', (opponent: PlayerInterface) => {
            setDecline(false);
            setOpponent(opponent);
            setShowNotif(true);
        });

        socket.on('searchGameDuel', ({ roomname, who }: { roomname: string, who: number }) => {
            setShowNotif(false);
            router.push(`/game?roomName=${roomname}&who=${who}`);
        });

        socket.on('declineDuelRequest', (opponent: PlayerInterface) => {
            setDecline(true);
            setOpponent(opponent);
            setShowNotif(true);
        });
    }, [socket]);

    return (
        <>
            <Navbar/>
            {(showNotif) && (<NotifContainer decline={decline}/>)}
            <main>{children}</main>
        </>
    );
}
