export interface Channel {
	id: number;
	name: string;
	topic: string;
	private: boolean;
	creation_date: Date;
	owner_id: number;
	password: string | null;
	owner: any;
	allowed: boolean; // true when channel is password protected and user has access, false otherwise
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

export interface Friend {
    id: number;
    name: string;
    avatar: string;
    userId: number;
    isOnline: boolean;
    isTyping: boolean;
    isPlaying: boolean;
    unreadMessages: number;
}

export interface SenderData {
	avatar: string;
	name: string;
	id: number;
}

export interface MessageData {
	content: string;
	sender: SenderData;
	timestamp: Date;
	message_id: number;
}

export interface ChannelStaff {
	owner_id: number;
	administrators: number[];
}