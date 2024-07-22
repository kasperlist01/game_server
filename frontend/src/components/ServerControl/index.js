import React, { useState, useEffect } from 'react';
import { Button, Row, Col, Card, Statistic, Spin } from 'antd';
import './ServerControl.css'; // Импортируем CSS файл

const ServerControl = ({ game }) => {
    const serverUrl = process.env.REACT_APP_SERVER_URL;
    const [serverStatus, setServerStatus] = useState('Stopped');
    const [loading, setLoading] = useState(false); // Состояние для отслеживания загрузки
    const [metrics, setMetrics] = useState({
        cpuUsage: 0,
        memoryUsage: 0,
        diskSpaceUsed: 0,
        networkActivity: 0
    });

    const fetchMetrics = async () => {
        try {
            const response = await fetch(serverUrl + '/metrics');
            const data = await response.json();
            setMetrics({
                cpuUsage: data.cpu_usage,
                memoryUsage: data.memory_usage,
                diskSpaceUsed: data.disk_space_used,
                networkActivity: data.network_activity
            });
        } catch (error) {
            console.error('Error fetching metrics:', error);
        }
    };

    useEffect(() => {
        fetchMetrics();
        const interval = setInterval(fetchMetrics, 10000); // Обновляем метрики каждые 10 секунд

        return () => clearInterval(interval); // Очищаем интервал при размонтировании компонента
    }, []);

    const handleStart = async () => {
        setLoading(true); // Устанавливаем состояние загрузки
        try {
            console.log(JSON.stringify({ game: game }));
            const response = await fetch(serverUrl + '/server/start', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ game: game })
            });
            const data = await response.json();
            setServerStatus(data.status);
        } catch (error) {
            console.error('Error starting server:', error);
        }
        setLoading(false); // Сбрасываем состояние загрузки
    };

    const handleStop = async () => {
        setLoading(true); // Устанавливаем состояние загрузки
        try {
            const response = await fetch(serverUrl + '/server/stop', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ game: game })
            });
            const data = await response.json();
            setServerStatus(data.status);
        } catch (error) {
            console.error('Error stopping server:', error);
        }
        setLoading(false); // Сбрасываем состояние загрузки
    };

    const handleRestart = async () => {
        setLoading(true); // Устанавливаем состояние загрузки
        try {
            const response = await fetch(serverUrl + '/server/restart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ game: game })
            });
            const data = await response.json();
            setServerStatus(data.status);
        } catch (error) {
            console.error('Error restarting server:', error);
        }
        setLoading(false); // Сбрасываем состояние загрузки
    };

    return (
        <div>
            <h2>{game} Server Control</h2>
            <p>Сейчас сервер: <b>{loading ? <Spin /> : serverStatus}</b></p>
            <Row gutter={16}>
                <Col>
                    <Button type="primary" onClick={handleStart} className="custom-button primary-button" disabled={loading}>Start</Button>
                </Col>
                <Col>
                    <Button type="danger" onClick={handleStop} className="custom-button danger-button" disabled={loading}>Stop</Button>
                </Col>
                <Col>
                    <Button type="default" onClick={handleRestart} className="custom-button default-button" disabled={loading || serverStatus === 'Stopped'}>Restart</Button>
                </Col>
            </Row>
            <Card title="Server Metrics" style={{ marginTop: 20 }}>
                <Row gutter={16}>
                    <Col span={12}>
                        <Statistic title="CPU Usage" value={metrics.cpuUsage} suffix="%" />
                    </Col>
                    <Col span={12}>
                        <Statistic title="Memory Usage" value={metrics.memoryUsage} suffix="MB" />
                    </Col>
                </Row>
                <Row gutter={16} style={{ marginTop: 20 }}>
                    <Col span={12}>
                        <Statistic title="Disk Space Used" value={metrics.diskSpaceUsed} suffix="GB" />
                    </Col>
                    <Col span={12}>
                        <Statistic title="Network Activity" value={metrics.networkActivity} suffix="Mbps" />
                    </Col>
                </Row>
            </Card>
        </div>
    );
};

export default ServerControl;
