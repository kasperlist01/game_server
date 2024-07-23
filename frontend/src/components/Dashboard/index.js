import React from 'react';
import './Dashboard.css';
import ServerControl from '../ServerControl';
import Logs from '../Logs';
import PlayerManagement from '../PlayerManagement';

function Dashboard({ current }) {
    let game;
    if (current === 'minecraft') {
        game = 'Minecraft';
    }
    else if (current === 'valheim') {
        game = 'Valheim';
    }

    return (
        <div className="dashboard">
            <h1>{game} Dashboard</h1>
            {current === 'minecraft' ? (
                <>
                    <ServerControl />
                    <h2>Player Management</h2>
                    <PlayerManagement />
                    <h2>Logs</h2>
                    <Logs game={game} />
                </>
            ) : (
                <p>Скоро будет...</p>
            )}
        </div>
    );
}

export default Dashboard;
