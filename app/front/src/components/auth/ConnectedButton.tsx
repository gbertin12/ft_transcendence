import { Link , Dropdown, User } from "@nextui-org/react";
import { useUser } from '@/contexts/user.context';

export default function ConnectedButton() {
    const { user } = useUser();

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
                    <Link href='/profile' color="text">View profile</Link>
                    </Dropdown.Item>
                <Dropdown.Item key="Logout" color="error">
                    <Link href="http://localhost:3000/auth/logout" color="error">Logout</Link>
                </Dropdown.Item>
            </Dropdown.Menu>
        </Dropdown>
    );
}
