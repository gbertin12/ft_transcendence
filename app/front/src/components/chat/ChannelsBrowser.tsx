import React, { useEffect, useState } from "react";

interface ChannelsBrowserProps {
	privateMessages: string[];
	defaultSelectedIndex?: number | undefined;
}

const ChannelsBrowser: React.FC<ChannelsBrowserProps> = ({ privateMessages, defaultSelectedIndex }) => {
	const [selectedIndex, setSelectedIndex] = useState<number | undefined>(defaultSelectedIndex);
	const [isLoading, setLoading] = useState(false);
	const [channels, setChannels] = useState<any>(null);

	useEffect(() => {
		setLoading(true);
		fetch("http://localhost:3001/channel/all")
		.then((res) => res.json())
		.then((data) => {
			setChannels(data);
			setLoading(false);
		}
		);
		setLoading(false);
		// setChannels([{"id":1,"title":"test","topic":"topic de test"},{"id":2,"title":"test2","topic":"un autre topic de test"}]);
	}, []);

	const changeFocus = (index: number) => {
		setSelectedIndex(index);
	};

	if (isLoading) return <li>Loading...</li>;
	if (!channels) return <li>Failed to fetch data</li>;

	return (
		<div className="pl-5 pt-2 py-1 bg-blue-950">
			<h2 className="text-3xl text-white">Salons</h2>
			<ul className="pl-2 pt-1">
				{channels.map((channel: any) => (
					<li
						className={`text-gray-200 flex gap-x-3 rounded-lg px-2 py-1 my-1 mr-2 cursor-pointer ${
							selectedIndex === channel.id ? "bg-blue-800" : "hover:bg-blue-500"
						}`}
						key={channel}
						onClick={() => changeFocus(channel.id)}
					>
						<h3 className="text-lg">#</h3>
						<h3 className="text-lg">{channel.title}</h3>
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

