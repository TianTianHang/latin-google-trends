import React, { ChangeEvent } from "react";
import { Avatar, Dropdown, MenuProps, Button, Input, Badge, Space, Col, Row } from "antd";
import { SkinOutlined, BellOutlined } from "@ant-design/icons";
import { debounce } from "@/utils/func";
import styles from "../index.module.scss";
import { useGlobalStore } from "@/stores/global";
import { useUserStore } from "@/stores/user";

const RightContent: React.FC = () => {
  const { resetToken } = useUserStore();
  const { setColor, primaryColor } = useGlobalStore();
  const logoutHandle = () => {
    resetToken();
  };
  const items: MenuProps["items"] = [
    {
      key: "1",
      label: <span onClick={logoutHandle}>退出登录</span>,
    },
  ];

  const changeMainColor = (e: ChangeEvent<HTMLInputElement>) => {
    setColor(e.target.value);
  };

  return (
    <Space size={20}>
      <Row gutter={16} align="middle">
        <Col>
          <Badge count={12}>
            <BellOutlined style={{ fontSize: 24 }} />
          </Badge>
        </Col>
        <Col>
          <div className={styles.skin}>
            <Button type="primary" shape="circle" icon={<SkinOutlined />} />
            <Input
              type="color"
              className={styles.skin_input}
              defaultValue={primaryColor}
              onChange={debounce(changeMainColor, 500)}
            />
          </div>
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