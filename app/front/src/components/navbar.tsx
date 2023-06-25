import { IconMedal,  IconMessageCircle2, IconDeviceGamepad } from '@tabler/icons-react';
import { Navbar } from "@nextui-org/react";
import ModalSign from "./auth/ModalSign";
import Link from 'next/link';

export default function myNavbar() {
    return (
        <Navbar maxWidth="fluid" variant="static" color="backgroundAlpha">
            <Navbar.Brand >
                <Link href="/" color="primary">ft_pong</Link>
            </Navbar.Brand >

            <Navbar.Content gap={50} >
                <Link href="/leaderboard">
                    <IconMedal size={50} strokeWidth={1.5}/>
                </Link>

                <Link href="/game">
                    <IconDeviceGamepad size={50} strokeWidth={1.5}/>
                </Link>

                <Link href="/chat">
                    <IconMessageCircle2 size={50} strokeWidth={1.5}/>
                </Link>
            </Navbar.Content>

            <Navbar.Content>
                <ModalSign/>
            </Navbar.Content>
        </Navbar>
    )
}
