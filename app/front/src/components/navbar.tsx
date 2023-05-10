import Image from 'next/image';
import { IconMedal } from '@tabler/icons-react';
import { IconMessageCircle2 } from '@tabler/icons-react';
import { IconDeviceGamepad } from '@tabler/icons-react';
import { Navbar , Button, Link, Text} from "@nextui-org/react";

export default function myNavbar() {
  return (
	      <Navbar variant="static" color="backgroundAlpha">
		  <Navbar.Brand >
              <Text color="primary">ft_pong</Text>
          </Navbar.Brand >
	          <Navbar.Content gap={50} >
	            <Navbar.Link href="/leaderboard" color="primary">
					<IconMedal size={50} strokeWidth={1.5}/>
				</Navbar.Link>
	            <Navbar.Link href="/game" color="primary">
					<IconDeviceGamepad size={50} strokeWidth={1.5}/>
				</Navbar.Link>
	            <Navbar.Link href="/chat" color="primary">
				<IconMessageCircle2 size={50} strokeWidth={1.5}/>
				</Navbar.Link>

	          </Navbar.Content>
			  <Navbar.Content color="primarySolidContrast">

			  <Navbar.Link href="/auth" color="primary">
				  Se connecter
			  </Navbar.Link>
			  </Navbar.Content>
	    </Navbar>
  )
}
