import React, { useState, useEffect, useRef } from 'react';
import { List, Spin } from 'antd';
import './Logs.css';

const Logs = ({ game }) => {
    const serverUrl = process.env.REACT_APP_SERVER_URL;
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const listRef = useRef(null);

    useEffect(() => {
        const wsUrl = serverUrl.replace(/^http/, 'ws');
        const ws = new WebSocket(`${wsUrl}/ws/logs`);

        ws.onmessage = (event) => {
            const newLog = event.data;
            setLogs((prevLogs) => [...prevLogs, newLog]);
        };

        ws.onopen = () => {
            console.log('WebSocket connection opened');
            setLoading(false);
        };

        ws.onclose = () => {
            console.log('WebSocket connection closed');
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            setLoading(false);
        };

        return () => {
            ws.close();
        };
    }, [serverUrl]);

    useEffect(() => {
        if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
        }
    }, [logs]);

    return (
        <div>
            <h2>{game} Logs</h2>
            {loading ? (
                <Spin />
            ) : (
                <div style={{ maxHeight: '400px', overflowY: 'auto' }} ref={listRef}>
                    <List
                        size="small"
                        bordered
                        dataSource={logs}
                        renderItem={item => <List.Item>{item}</List.Item>}
                    />
                </div>
            )}
        </div>
    );
};

export default Logs;
