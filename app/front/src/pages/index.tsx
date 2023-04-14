import React from "react";
import ChatBox from "./chat/ChatBox";

const Home: React.FC = () => {
	return (
		<div>
			<ChatBox
				privateMessages={[
					"bob",
					"alice",
				]}
			/>
		</div>
	);
};	
export default Home;