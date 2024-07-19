import React from 'react';
import { Input, List } from 'antd';
import './Logs.css';

const logs = [
    "Server started at 10:00 AM",
    "Player joined: JohnDoe",
    "Error: Connection lost",
    "Player left: JaneDoe",
    "Server started at 10:00 AM",
    "Player joined: JohnDoe",
    "Error: Connection lost",
    "Player left: JaneDoe",
    "Server started at 10:00 AM",
    "Player joined: JohnDoe",
    "Error: Connection lost",
    "Player left: JaneDoe"
];

const Logs = ({ game }) => {
    return (
        <div>
            <h2>{game} Logs</h2>
            <List
                size="small"
                bordered
                dataSource={logs}
                renderItem={item => <List.Item>{item}</List.Item>}
                style={{ maxHeight: '200px', overflowY: 'auto' }}
            />
        </div>
    );
};

export default Logs;