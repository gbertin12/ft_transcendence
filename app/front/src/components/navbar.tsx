import { IconMedal } from '@tabler/icons-react';
import { IconMessageCircle2 } from '@tabler/icons-react';
import Link from 'next/link';
import { IconDeviceGamepad } from '@tabler/icons-react';
import { Navbar , Text } from "@nextui-org/react";
import ModalSign from "./auth/ModalSign";

export default function myNavbar() {

    return (
        <Navbar maxWidth="fluid" variant="static" color="backgroundAlpha">
            <Navbar.Brand >
                <Text color="primary">ft_pong</Text>
            </Navbar.Brand >

            <Navbar.Content gap={50} >
                <Link href='/leaderboard'>
                    <IconMedal size={50} strokeWidth={1.5}/>
                </Link>

                <Link href='/game'>
                    <IconDeviceGamepad size={50} strokeWidth={1.5}/>
                </Link>

                <Link href='/chat'>
                    <IconMessageCircle2 size={50} strokeWidth={1.5}/>
                </Link>
            </Navbar.Content>

            <Navbar.Content color="primarySolidContrast">
                <ModalSign/>
            </Navbar.Content>
        </Navbar>
    )
}
