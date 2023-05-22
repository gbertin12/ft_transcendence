export interface Channel {
	id: number;
	name: string;
	topic: string;
	private: boolean;
	creation_date: Date;
	owner_id: number;
	password: string | null;
	owner: any;
}

export interface Message {
	channel_id: number;
	sender_id: number;
	message_id: number;
	timestamp: Date;
	content: string;
}

export interface User {
    id:        number;
    name:      string;
    avatar:    string;
    wins:      number;
    losses:    number;
    elo:       number;
    otp:       boolean;
    password:  string;
    otpSecret?: string;
}

export interface FriendRequest {
	request_id: number;
	sender_id: number;
	receiver_id: number;
	timestamp: Date;
	sender: User;
}