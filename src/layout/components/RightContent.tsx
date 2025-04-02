import React, { useState } from "react";
import { Avatar, Dropdown, MenuProps, Space, Col, Row, Modal } from "antd";
import { BellOutlined } from "@ant-design/icons";
import { useUserStore } from "@/stores/user";
import LanguageSwitcher from "./LanguageSwitcher";
import ProfilePage from "@/views/ProfilePage";
import { useTranslation } from "react-i18next";

const RightContent: React.FC = () => {
  const { resetToken } = useUserStore();
  const [profileVisible, setProfileVisible] = useState(false);
  const {t}=useTranslation()
  const logoutHandle = () => {
    resetToken();
  };

  const items: MenuProps["items"] = [
    {
      key: "1",
      label: <span onClick={logoutHandle}>{t('layout.logout')}</span>,
    },
    {
      key: "2",
      label: <span onClick={() => setProfileVisible(true)}>{t('layout.profile')}</span>,
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

      <Modal
       title={t('layout.profile')}
       open={profileVisible}
       onCancel={() => setProfileVisible(false)}
       footer={null}
       width={800}
       destroyOnClose
     >
        <ProfilePage />
      </Modal>
    </Space>
  );
};

export default RightContent;
