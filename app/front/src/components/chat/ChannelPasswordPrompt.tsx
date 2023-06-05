import { Channel } from '@/interfaces/chat.interfaces';
import { Button, Input, Loading, Text } from '@nextui-org/react';
import React from 'react';

interface ChannelPasswordPromptProps {
    channel: Channel;
}

async function joinChannel(channel: Channel, password: string): Promise<boolean> {
    const url = `http://localhost:3000/channel/${channel.id}/join`;
    const res = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
    });
    return (res.status === 201); // the server returns 201 if the user joined the channel
}

const ChannelPasswordPrompt: React.FC<ChannelPasswordPromptProps> = ({ channel }) => {
    const [working, setWorking] = React.useState<boolean>(false);
    const [password, setPassword] = React.useState<string>("");

    return (
        <div className="flex flex-col items-center justify-center h-full">
            <h1 className="text-3xl font-bold">Ce salon est protégé par un mot de passe</h1>
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
                    onClick={() => {
                        setWorking(true);
                        joinChannel(channel, password).then((success: boolean) => {
                            if (!success) {
                                setTimeout(() => { // avoid front being too fast
                                    setWorking(false);
                                }, 1000);
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