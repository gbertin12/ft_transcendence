// import Link from 'next/link';
import Image from 'next/image';
import { IconMedal } from '@tabler/icons-react';
import { IconMessageCircle2 } from '@tabler/icons-react';
import { IconDeviceGamepad } from '@tabler/icons-react';
import { Navbar , Button, Link} from "@nextui-org/react";

// <div className="grid text-center grid-cols-3 bg-[#DFDFDF] justify-items-center">
// dark:bg-slate-800                                  dark:bg-[#121212]

export default function myNavbar() {
  return (
	      <Navbar isBordered variant="static">
		  <Navbar.Brand>
              ft_pong
          </Navbar.Brand>
	          <Navbar.Content gap={50}>
	            <Navbar.Link href="/leaderboard">
					<IconMedal size={50} strokeWidth={1.5}/>
				</Navbar.Link>
	            <Navbar.Link href="/game">
					<IconDeviceGamepad size={50} strokeWidth={1.5}/>
				</Navbar.Link>
	            <Navbar.Link href="/chat">
				<IconMessageCircle2 size={50} strokeWidth={1.5}/>
				</Navbar.Link>

	          </Navbar.Content>
			  <Navbar.Content>

			  <Navbar.Link href="/auth">
				  Se connecter
			  </Navbar.Link>
			  </Navbar.Content>

	    </Navbar>
  )
}

// export default function Navbar() {
//   return (
// 	<>
// 	<div className="flex flex-row justify-between items-center h-16 xl:h-20 bg-[#DFDFDF]">
// 		<Link href="/" className="px-5 py-4">
// 			Home
// 		</Link>
//
// 	  <div className="flex flex-row justify-between justify-items-center w-1/3 ">
// 		<Link href="/leaderboard">
// 			<IconMedal size={50} strokeWidth={1.5}/>
// 		</Link>
//
// 		<Link href="/game ">
// 			<IconDeviceGamepad size={50} strokeWidth={1.5}/>
// 		</Link>
// 	    <Link href="/chat">
// 			<IconMessageCircle2 size={50} strokeWidth={1.5}/>
// 	    </Link>
// 	  </div>
//
// 		  <Link href="/auth"
// 			  className="px-5 py-4">
// 			Se connecter
// 		</Link>
// 		</div>
//  	</>
// 	)
// }
