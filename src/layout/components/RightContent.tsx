import React from "react";
import { Avatar, Dropdown, MenuProps, Space, Col, Row } from "antd";
import { BellOutlined } from "@ant-design/icons";
import { useUserStore } from "@/stores/user";
import LanguageSwitcher from './LanguageSwitcher';

const RightContent: React.FC = () => {
  const { resetToken } = useUserStore();
  const logoutHandle = () => {
    resetToken();
  };
  const items: MenuProps["items"] = [
    {
      key: "1",
      label: <span onClick={logoutHandle}>退出登录</span>,
    },
  ];

  return (
    <Space size={20}>
      <Row gutter={16} align="middle">
      <Col>
          <LanguageSwitcher />
        </Col>
        <Col>
        <BellOutlined style={{ fontSize: 24 }} />
        </Col>
        <Col>
          <Dropdown menu={{ items }} placement="bottomRight">
            <Avatar
              src="https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png"
              style={{ cursor: "pointer" }}
            />
          </Dropdown>
        </Col>
      </Row>
    </Space>
  );
};

export default RightContent;
