import { Elo } from '@/interfaces/profile.interface';
import { User } from '@/interfaces/user.interface';
import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function formatDate(date: Date): string {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    return `${date.toLocaleDateString()}`;
}

async function fetchElo(username: string, date: Date): Promise<number> {
    const res = await fetch(`http://bess-f1r2s10:3000/user/elo/day/${username}?date=${date.toISOString()}`, {
        credentials: "include",
    });
    const elo = await res.text();

    return parseInt(elo);
}

async function fetchEloGeneral(date: Date): Promise<number> {
    const res = await fetch(`http://bess-f1r2s10:3000/user/elo/general?date=${date.toISOString()}`);
    const elo = await res.text();

    return parseInt(elo);
}

export default function EloChart({ user }: { user: User }) {
    const [ data, setData ] = useState<Elo[]>([]);

    useEffect(() => {
        (async () => {
            let startDate = new Date();
            startDate.setMonth(startDate.getMonth() - 1);
            let data: Elo[] = [];
            for (let i = 0; i < 50; i += 7) {
                let date = new Date();
                date.setDate(date.getDate() - i);
                const general = await fetchEloGeneral(date);
                const player = await fetchElo(user.name, date);
                const elo: Elo = { general, player, date: formatDate(date), amt: player };
                data.unshift(elo);
            }

            const now = new Date();
            const general = await fetchEloGeneral(now);
            const elo: Elo = { general, player: user.elo, date: formatDate(now), amt: user.elo };
            data.push(elo);

            setData(data);
        })();
    }, []);

    return (
         <ResponsiveContainer width="100%" height={550}>
            <LineChart
                data={data}
                margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="general" stroke="#8884d8" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="player" stroke="#82ca9d" />
            </LineChart>
        </ResponsiveContainer>
    );
}
