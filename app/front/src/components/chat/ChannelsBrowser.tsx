import React, { useState } from "react";

interface ChannelsBrowserProps {
	channels: string[];
	privateMessages: string[];
	defaultSelectedIndex?: number | undefined;
}

const ChannelsBrowser: React.FC<ChannelsBrowserProps> = ({ channels, privateMessages, defaultSelectedIndex }) => {
	const [selectedIndex, setSelectedIndex] = useState<number | undefined>(defaultSelectedIndex);

	const changeFocus = (index: number) => {
		setSelectedIndex(index);
	};

	return (
		<div className="pl-5 pt-2 py-1 bg-blue-950">
			<h2 className="text-3xl text-white">Salons</h2>
			<ul className="pl-2 pt-1">
				{channels.map((channel, index) => (
					<li
						className={`text-gray-200 flex gap-x-3 rounded-lg px-2 py-1 my-1 mr-2 cursor-pointer ${
							selectedIndex === index ? "bg-blue-800" : "hover:bg-blue-500"
						}`}
						key={channel}
						onClick={() => changeFocus(index)}
					>
						<h3 className="text-lg">#</h3>
						<h3 className="text-lg">{channel}</h3>
					</li>
				))}
			</ul>
			<hr className="border-slate-100 my-4 w-2/3 mx-auto" />
			<h2 className="text-3xl text-white">Messages privés</h2>
			<ul className="pl-2 pt-1">
				{privateMessages.map((privateMessage, index) => (
					<li
						className={`text-gray-200 flex gap-x-3 rounded-lg px-2 py-1 my-1 mr-2 cursor-pointer ${
							selectedIndex === index + channels.length ? "bg-blue-800" : "hover:bg-blue-500"
						}`}
						key={privateMessage}
						onClick={() => changeFocus(index + channels.length)}
					>
						<h3 className="text-lg">@</h3>
						<h3 className="text-lg">{privateMessage}</h3>
					</li>
				))}
			</ul>
		</div>
	);
};

export default ChannelsBrowser;

