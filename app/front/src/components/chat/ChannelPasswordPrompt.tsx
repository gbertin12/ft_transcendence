import { Channel } from '@/interfaces/chat.interfaces';
import { Button, Input, Loading, Text } from '@nextui-org/react';
import React from 'react';
import axios from 'axios';

interface ChannelPasswordPromptProps {
    channel: Channel;
}

async function joinChannel(channel: Channel, password: string): Promise<number> {
    return axios.post(
        `http://localhost:3000/channel/${channel.id}/join`,
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

const ChannelPasswordPrompt: React.FC<ChannelPasswordPromptProps> = ({ channel }) => {
    const [working, setWorking] = React.useState<boolean>(false);
    const [error, setError] = React.useState<string>("");
    const [password, setPassword] = React.useState<string>("");

    return (
        <div className="flex flex-col items-center justify-center h-full">
            <Text h1 className="text-3xl font-bold">Ce salon est protégé par un mot de passe</Text>
            {error.length > 0 && (
                <Text h3 color="error">
                    {error}
                </Text>
            )}
            <div className="flex items-center justify-center mt-4 gap-x-2">
                <Input
                    clearable
                    type="password"
                    placeholder="Mot de passe"
                    aria-label="Mot de passe du salon"
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
                                    setError("Mot de passe incorrect");
                                    setTimeout(() => {
                                        setWorking(false);
                                    }, 1000);
                                    break;
                                case 403:
                                    setError("Vous êtes banni de ce salon");
                                    setTimeout(() => {
                                        setWorking(false);
                                    }, 1000);
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