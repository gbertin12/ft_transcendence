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
    receiver_id: number;
    requested_at: Date;
    sender: User;
    receiver: User;
    sender_id: number;
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
    sender: User;
    timestamp: Date;
    message_id: number;
}

export interface ChannelStaff {
    owner_id: number;
    administrators: number[];
}

export type PowerAction = 'deleted' | 'muted' | 'banned' | 'kicked';

export interface PowerActionData {
    action: PowerAction;
    channel: number;
    targetSender: SenderData;
    targetMessage: MessageData;
    dm?: boolean;
}

export interface PunishmentData {
    type: PowerAction;
    channel_id: number;
    duration?: number; // if null, the punishment is permanent, in seconds
    expires_at?: Date; // can be null, depends
}

export interface Relationships {
    friends: any[];
    blocked: any[];
}
