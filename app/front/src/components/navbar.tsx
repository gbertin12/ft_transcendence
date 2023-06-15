import Image from 'next/image';
import { IconMedal } from '@tabler/icons-react';
import { IconMessageCircle2 } from '@tabler/icons-react';
import { IconDeviceGamepad } from '@tabler/icons-react';
import { Navbar, Button, Link, Modal, Text, Input, Spacer, Grid } from "@nextui-org/react";
import ModalSign from "./auth/ModalSign";
// type NavbarMaxWidth = "fluid";

export function TranscendenceNavbar() {

	return (
		<Navbar maxWidth="fluid" variant="static" color="backgroundAlpha" css={{margin: "12px"}}>
			<Navbar.Brand >
				<Text h1 size={20} color="primary">ft_pong</Text>
			</Navbar.Brand >
			<Navbar.Content gap={50} >
				<Navbar.Link href="/leaderboard" color="primary">
					<IconMedal size={50} strokeWidth={1.5} />
				</Navbar.Link>
				<Navbar.Link href="/game" color="primary">
					<IconDeviceGamepad size={50} strokeWidth={1.5} />
				</Navbar.Link>
				<Navbar.Link href="/chat" color="primary">
					<IconMessageCircle2 size={50} strokeWidth={1.5} />
				</Navbar.Link>

			</Navbar.Content>
			<Navbar.Content>
				<ModalSign />
			</Navbar.Content>
		</Navbar>
	)
}
