import { Link , Dropdown, User, defaultTheme} from "@nextui-org/react";
// import { User } from "@/interfaces/user.interface";
import { useUser } from '@/contexts/user.context';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

function redirMyProfile() {
	window.location.href = 'http://localhost:8000/profile';
}

// window.location.href = `http://localhost:8000/user/${user.name}`;
// window.location.href = `http://localhost:8000/auth/${user.name}`;


// function changeTheme() {
// 	ThemeProviderProps.value == "light" ?
//     ThemeProviderProps.value == "dark" :
//     ThemeProviderProps.value == "light";
// }

export default function ConnectedButton() {
    const { user } = useUser();
    console.log(user);

    return (
        <Dropdown>
          <Dropdown.Trigger>
            <User
              bordered
              zoomed
              as="button"
              size="lg"
              color="primary"
              name={user.name}
              src={`http://localhost:3000/static/avatars/${user.avatar}`}
            />
          </Dropdown.Trigger>
            <Dropdown.Menu aria-label="Connected Menu">
                <Dropdown.Item key="profile">
                    <Link href='http://localhost:8000/profile' color="text">View profile</Link>
                    </Dropdown.Item>
                <Dropdown.Item key="Logout" color="error">
                    Logout
                </Dropdown.Item>
            </Dropdown.Menu>
        </Dropdown>
    );
}
