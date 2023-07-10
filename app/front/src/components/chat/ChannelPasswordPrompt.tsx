import { Channel } from '@/interfaces/chat.interfaces';
import { Button, Input, Loading, Text } from '@nextui-org/react';
import React, { Dispatch, SetStateAction } from 'react';
import axios from 'axios';

interface ChannelPasswordPromptProps {
    channel: Channel;
    validCallback: Dispatch<SetStateAction<boolean>>;
}

async function joinChannel(channel: Channel, password: string): Promise<number> {
    return axios.post(
        `http://paul-f4br5s1:3000/channel/${channel.id}/join`,
        { password },
        {
            withCredentials: true,
            validateStatus: () => true,
        }
    )
    .then((res) => {
        return res.status;
    });
}

const ChannelPasswordPrompt: React.FC<ChannelPasswordPromptProps> = ({ channel, validCallback }) => {
    const [working, setWorking] = React.useState<boolean>(false);
    const [error, setError] = React.useState<string>("");
    const [password, setPassword] = React.useState<string>("");

    return (
        <div className="flex flex-col items-center justify-center h-full">
            <Text h1 className="text-3xl font-bold">This channel is password protected</Text>
            {error.length > 0 && (
                <Text h3 color="error">
                    {error}
                </Text>
            )}
            <div className="flex items-center justify-center mt-4 gap-x-2">
                <Input
                    clearable
                    type="password"
                    placeholder="Password"
                    aria-label="Channel password"
                    onChange={(e) => setPassword(e.target.value)}
                />
                <Button
                    auto
                    disabled={working || (password.length < 2 && password.length > 100)}
                    color="primary"
                    onClick={() => {
                        setWorking(true);
                        joinChannel(channel, password).then((response: number) => {
                            switch (response) {
                                case 401:
                                    setError("Invalid password");
                                    setTimeout(() => {
                                        setWorking(false);
                                    }, 1000);
                                    break;
                                case 403:
                                    setError("You are banned from this channel");
                                    setTimeout(() => {
                                        setWorking(false);
                                    }, 1000);
                                    break;
                                case 201:
                                    validCallback(false);
                                    break;
                                default:
                                    setError("");
                                    break;
                            }
                        });
                    }}
                >
                    {!working && (
                        <Text
                            span
                            color="currentColor"
                        >
                            Rejoindre
                        </Text>
                    ) || (
                            <Loading type="points-opacity" color="currentColor" size="sm" />
                        )}
                </Button>
            </div>
        </div>
    );
};

export default ChannelPasswordPrompt;