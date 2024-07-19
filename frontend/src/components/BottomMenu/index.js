import React, { useState } from 'react';
import { Menu } from 'antd';
import {
    HomeOutlined,
    UserOutlined,
    DatabaseOutlined,
} from '@ant-design/icons';
import './BottomMenu.css';
import ServerControl from '../ServerControl/index';
import PlayerManagement from '../PlayerManagement/index';
import Logs from '../Logs/index';
import ProfilePage from '../ProfilePage/index';

const BottomMenu = ({ currentGame }) => {
    const [selectedMenu, setSelectedMenu] = useState('home');

    const handleMenuClick = (e) => {
        setSelectedMenu(e.key);
    };

    const renderContent = () => {
        switch (selectedMenu) {
            case 'home':
                return <ServerControl game={currentGame} />;
            case 'admin':
                return (
                    <>
                        <PlayerManagement game={currentGame} />
                        <Logs game={currentGame} />
                    </>
                );
            case 'profile':
                return <ProfilePage game={currentGame} />;
            default:
                return <ServerControl game={currentGame} />;
        }
    };

    return (
        <>
            <div className="content">
                {renderContent()}
            </div>
            <div className="bottom-menu">
                <Menu mode="horizontal" className="menu" onClick={handleMenuClick} selectedKeys={[selectedMenu]}>
                    <Menu.Item key="home" icon={<HomeOutlined />}>
                        Home
                    </Menu.Item>
                    <Menu.Item key="admin" icon={<DatabaseOutlined />}>
                        Admin
                    </Menu.Item>
                    <Menu.Item key="profile" icon={<UserOutlined />}>
                        Profile
                    </Menu.Item>
                </Menu>
            </div>
        </>
    );
};

export default BottomMenu;
