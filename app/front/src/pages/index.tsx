import React from "react";
import ChatBox from "./chat/ChatBox";

const Home: React.FC = () => {
	return (
		<div>
			<ChatBox
				channels={[
					"general",
					"random",
				]}
				privateMessages={[
					"bob",
					"alice",
				]}
			/>
		</div>
	);
};	
export default Home;