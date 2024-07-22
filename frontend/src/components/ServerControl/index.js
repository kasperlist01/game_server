import React, { useState, useEffect } from 'react';
import { Button, Row, Col, Card, Statistic } from 'antd';
import './ServerControl.css'; // Импортируем CSS файл

const ServerControl = ({ game }) => {
    const [serverStatus, setServerStatus] = useState('Stopped');
    const [metrics, setMetrics] = useState({
        cpuUsage: 0,
        memoryUsage: 0,
        diskSpaceUsed: 0,
        networkActivity: 0
    });

    const fetchMetrics = async () => {
        try {
            const response = await fetch('http://localhost:8001/metrics');
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
        const interval = setInterval(fetchMetrics, 1000); // Обновляем метрики каждые 10 секунд

        return () => clearInterval(interval); // Очищаем интервал при размонтировании компонента
    }, []);

    const handleStart = async () => {
        try {
            const response = await fetch('http://localhost:8001/server/start', { method: 'POST', body: JSON.stringify(game)});
            const data = await response.json();
            setServerStatus(data.status);
        } catch (error) {
            console.error('Error starting server:', error);
        }
    };

    const handleStop = async () => {
        try {
            const response = await fetch('http://localhost:8001/server/stop', { method: 'POST' });
            const data = await response.json();
            setServerStatus(data.status);
        } catch (error) {
            console.error('Error stopping server:', error);
        }
    };

    const handleRestart = async () => {
        try {
            const response = await fetch('http://localhost:8001/server/restart', { method: 'POST' });
            const data = await response.json();
            setServerStatus(data.status);
            setTimeout(() => {
                setServerStatus('Running');
            }, 2000);
        } catch (error) {
            console.error('Error restarting server:', error);
        }
    };

    return (
        <div>
            <h2>{game} Server Control</h2>
            <p>Сейчас сервер: <b>{serverStatus}</b></p>
            <Row gutter={16}>
                <Col>
                    <Button type="primary" onClick={handleStart} className="custom-button primary-button">Start</Button>
                </Col>
                <Col>
                    <Button type="danger" onClick={handleStop} className="custom-button danger-button">Stop</Button>
                </Col>
                <Col>
                    <Button type="default" onClick={handleRestart} className="custom-button default-button">Restart</Button>
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
