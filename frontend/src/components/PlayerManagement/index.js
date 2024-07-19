import React, { useState } from 'react';
import { Table, Button, Input, Card } from 'antd';

const players = [
    { key: '1', name: 'JohnDoe', status: 'Online' },
    { key: '2', name: 'JaneDoe', status: 'Online' },
    { key: '3', name: 'JaneDoe', status: 'Online' },
    { key: '4', name: 'JaneDoe', status: 'Online' },
    { key: '5', name: 'JaneDoe', status: 'Online' },
    { key: '6', name: 'JaneDoe', status: 'Online' },
    { key: '7', name: 'JaneDoe', status: 'Online' },
    { key: '8', name: 'JaneDoe', status: 'Online' },
    { key: '9', name: 'JaneDoe', status: 'Online' }
];

const columns = [
    {
        title: 'Player Name',
        dataIndex: 'name',
        key: 'name',
    },
    {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
    },
    {
        title: 'Action',
        key: 'action',
        render: (_, record) => (
            <span>
                <Button type="link">Kick</Button>
                <Button type="link">Ban</Button>
            </span>
        ),
    },
];

const PlayerManagement = ({ game }) => {
    const [command, setCommand] = useState('');

    const handleSendCommand = () => {
        // Логика для отправки команды на сервер
        console.log(`Sending command to ${game} server: ${command}`);
        setCommand('');
    };

    return (
        <div>
            <h2>{game} Player Management</h2>
            <Table columns={columns} dataSource={players} pagination={false} scroll={{ y: 200 }} />
            <Card title="Server Commands" style={{ marginTop: 20 }}>
                <Input
                    placeholder="Enter command"
                    value={command}
                    onChange={(e) => setCommand(e.target.value)}
                    onPressEnter={handleSendCommand}
                />
                <Button type="primary" onClick={handleSendCommand} style={{ marginTop: 10 }}>Send Command</Button>
            </Card>
        </div>
    );
};

export default PlayerManagement;
