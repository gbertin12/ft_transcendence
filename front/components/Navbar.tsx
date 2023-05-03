import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
  return (
	<>
	<Link href="/">
		Home
	</Link>
	<Link legacyBehavior href="/leaderboard">
	  <a>
		<Image
		  src="/../assets/console.png"
		  width={50}
		  height={50}
		/>
	  </a>
	</Link>
	<Link legacyBehavior href="/game">
	  <a>
		<Image
		  src="/../assets/console.png"
		  width={50}
		  height={50}
		/>
	  </a>
	</Link>
	<Link legacyBehavior href="/chat">
	  <a>
		<Image
		  src="/../assets/console.png"
		  width={50}
		  height={50}
		/>
	  </a>
	</Link>
	<Link legacyBehavior href="/auth">
	  <a>
		<Image
		  src="/../assets/console.png"
		  width={50}
		  height={50}
		/>
	  </a>
	</Link>
  </>
  )
}
