import { Channel } from '@/interfaces/chat.interfaces';
import React from 'react';

interface ResetTabProps {
    channel: Channel;
}

const ResetTab: React.FC<ResetTabProps> = ({ channel }) => {
    return (
        <h1>Reset</h1>
    );
};

export default ResetTab;