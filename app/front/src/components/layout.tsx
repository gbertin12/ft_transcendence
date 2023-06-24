import utilStyles from '../styles/utils.module.css';
import Navbar from './navbar'
import { useEffect } from 'react';
import { useUser } from '@/contexts/user.context';
import { PlayerInterface } from '@/interfaces/pong.interface';
import NotifContainer from './pong/NotifContainer';
import { useNotif } from '@/contexts/notif.context';

export default function Layout({ children }) {
    const { socket } = useUser();
    const { showNotif, setShowNotif, setOpponent } = useNotif();

    useEffect(() => {
        socket.on('duelRequest', (opponent: PlayerInterface) => {
            setShowNotif(true);
            setOpponent(opponent);
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
