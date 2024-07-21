import React, { useState } from 'react';
import { Menu as AntMenu, Row, Col } from 'antd';
import './Menu.css';
import BottomMenu from '../BottomMenu/index';
import { ReactComponent as MinecraftIcon } from './assets/icons/minecraft.svg';
import { ReactComponent as ValheimIcon } from './assets/icons/valheim.svg';

const CustomMenu = () => {
    const [current, setCurrent] = useState('Minecraft');

    const handleClick = e => {
        setCurrent(e.key);
    };

    return (
        <>
            <Row justify="center" align="middle" style={{ width: '100%' }}>
                <Col xs={2} sm={6} md={8}></Col>
                <Col xs={10} sm={6} md={4} className="menu-column">
                    <AntMenu mode="horizontal" onClick={handleClick} selectedKeys={[current]} className="menu-container">
                        <AntMenu.Item key="Minecraft" icon={<MinecraftIcon style={{ width: 20, height: 20 }} />}>
                            Minecraft
                        </AntMenu.Item>
                    </AntMenu>
                </Col>
                <Col xs={10} sm={6} md={4} className="menu-column">
                    <AntMenu mode="horizontal" onClick={handleClick} selectedKeys={[current]} className="menu-container">
                        <AntMenu.Item key="Valheim" icon={<ValheimIcon style={{ width: 20, height: 20 }} />}>
                            Valheim
                        </AntMenu.Item>
                    </AntMenu>
                </Col>
                <Col xs={2} sm={6} md={8}></Col>
            </Row>
            <BottomMenu currentGame={current} />
        </>
    );
};

export default CustomMenu;
