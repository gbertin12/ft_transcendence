import React, { Suspense } from "react";
import ChatBox from "../../components/chat/ChatBox";
import { Loading, Spinner } from "@nextui-org/react";

const Chat: React.FC = () => {
	return (
		<Suspense fallback={<Loading size="xl" css={{ margin: "auto" }} />}>
			<ChatBox />
		</Suspense>
	);
};
export default Chat;