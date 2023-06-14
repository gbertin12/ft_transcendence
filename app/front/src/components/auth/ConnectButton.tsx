import { Modal, Button, Text, Input, Grid } from "@nextui-org/react";
import  { User } from "@/interfaces/user.interface";
import { useUser } from '@/contexts/user.context';


const ConnectButton: React.FC = () => {
	const {user}  = useUser();
	
	if (!user.id) {
		return (
			<Button auto onPress={}>
				<Text bold color="secondary">Connecter </Text>
			</Button>
		);
	}
	return (
		<Button auto onPress={handler}>
			<Text bold color="secondary">Se connecter </Text>
		</Button>
	);
}
