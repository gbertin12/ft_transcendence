import React, { useState } from "react";

interface MessageInputProps {
	onSend: (message: string) => void;
	muted?: boolean | undefined;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSend, muted }) => {
	const [inputValue, setInputValue] = useState("");

	const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setInputValue(event.target.value);
	};

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault(); // Prevent page reload
		if (inputValue === "") return;	// Don't send empty messages
		if (muted) return;				// Don't send messages if muted (shouldn't happen)
		onSend(inputValue);		// Call the callback
		setInputValue("");		// Clear the input
	};

	return (
		<form onSubmit={handleSubmit}>
			<input
				type="text"
				disabled={muted}
				placeholder={muted ? "You cannot send messages" : "Type your message"}
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
