import React, { useState } from "react";

const MessageInput: React.FC = () => {
	const [inputValue, setInputValue] = useState("");

	const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setInputValue(event.target.value);
	};

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		// TODO: Implement onSubmit
		console.log("Submitted message:", inputValue);
		setInputValue("");
	};
	return (
		<form onSubmit={handleSubmit}>
			<input
				type="text"
				placeholder="Type your message..."
				value={inputValue}
				onChange={handleInputChange}
				className="border-gray-300 border-solid border p-2 rounded-md w-full"
			/>
			<button
				type="submit"
				className="bg-blue-500 text-white font-semibold py-2 px-4 mt-2 rounded-md hover:bg-blue-600"
			>
			Send
			</button>
		</form>
	);
};

export default MessageInput;
