export interface Channel {
	id: number;
	name: string;
	topic: string;
	private: boolean;
	creation_date: Date;
	owner_id: number;
	password: string;
	owner: any;
}

export interface Message {
	channel_id: number;
	sender_id: number;
	message_id: number;
	timestamp: Date;
	content: string;
}
