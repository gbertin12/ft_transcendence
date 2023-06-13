import { Container, Text } from '@nextui-org/react';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label } from 'recharts';

interface HourlyMessageChartProps {
    channel_id: number;
    hours: number;
}

const HourlyMessageChart: React.FC<HourlyMessageChartProps> = ( { channel_id, hours } ) => {
    const [chartData, setChartData] = useState<any>();

    useEffect(() => {
        axios.get(`http://bess-f1r2s10:3000/datas/hourly_messages/${channel_id}/${hours}`,
            {
                withCredentials: true,
                validateStatus: () => true
            }).then((res) => {
                if (res.status !== 200) {
                    return;
                }
                res.data.forEach((data: any, index: number) => {
                    const offset = new Date().getTimezoneOffset() / 60 * -1;
                    data.name = `${data.hour + offset}:00`;
                });
                setChartData(res.data);
            });
    }, []);

    return (
        <BarChart
            width={500}
            height={300}
            data={chartData}
            margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
            }}
        >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="usersCount" name="Users" stackId="a" fill="#0072F5" />
            <Bar dataKey="adminCount" name="Admin" stackId="a" fill="#F5A524" />
            <Bar dataKey="ownerCount" name="Owner" stackId="a" fill="#F31260" />
        </BarChart>
    );
}

export default HourlyMessageChart;