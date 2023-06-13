import { useRouter } from "next/router";
import ChatLayout from "../layout";
import { Channel, User } from "@/interfaces/chat.interfaces";
import { useChat } from "@/contexts/chat.context";
import { useEffect, useState } from "react";
import DMChatBox from "@/components/chat/DMChatBox";
import axios from "axios";
import { Button, Loading } from "@nextui-org/react";

function getErrorCode(status: number): JSX.Element {
    switch (status) {
        case -1:
            return <Loading size="lg" />;
        case 401:
            return (
                <>
                    <h1 className="text-3xl font-bold">Unauthorized</h1>
                    <p className="text-xl">You must be logged in to perform this operation.</p>
                </>
            );
        case 403:
            return (
                <>
                    <h1 className="text-3xl font-bold">Forbidden</h1>
                    <p className="text-xl">You must be friend with this user to send any message.</p>
                    <Button>
                        Send a friend request (TODO)
                    </Button>
                </>
            );
        case 404:
            return (
                <>
                    <h1 className="text-3xl font-bold">Unknown user</h1>
                    <p className="text-xl">This user doesn't exists.</p>
                </>
            );
        default: // sus
            return (
                <>
                    <h1 className="text-3xl font-bold">Unknown error</h1>
                    <p className="text-xl">An unknown error occured.</p>
                </>
            );
    }
}

const ChannelChat: React.FC = () => {
    const router = useRouter();
    const { id } = router.query;
    const [interlocutor, setInterlocutor] = useState<User>({} as User);
    const [errorCode, setErrorCode] = useState<number>(-1); // -1 if the request wasn't sent

    // TODO: move this logic into our chatbox component (when fetching messages)
    useEffect(() => {
        // HTTP get to get interlocutor data
        //  - 401 -> not logged in
        //  - 403 -> users aren't friends
        //  - 404 -> user not found
        //  - 200 -> success (user is returned in response body)
        if (id === undefined) return;
        axios.get(`http://localhost:3000/dms/interlocutor/${id}`, {
            withCredentials: true,
        })
        .then((res) => {
            setInterlocutor(res.data);
            setErrorCode(200);
        }).catch((err) => {
            setErrorCode(err.response.status);
        });
    }, [id]);

    if (errorCode !== 200) {
        return (
            <ChatLayout>
                <div className="flex flex-col items-center justify-center h-full">
                    {getErrorCode(errorCode)}
                </div>
            </ChatLayout>
        );
    }

    // If we're here, the server returned us a 200 status code
    return (
        <ChatLayout>
            <DMChatBox interlocutor={interlocutor} />
        </ChatLayout>
    );
}

export default ChannelChat;