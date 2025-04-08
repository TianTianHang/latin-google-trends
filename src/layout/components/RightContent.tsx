import React, { useState } from "react";
import { Avatar, Dropdown, MenuProps, Space, Col, Row, Modal } from "antd";
import { BellOutlined, DownloadOutlined, FullscreenOutlined } from "@ant-design/icons";
import { useUserStore } from "@/stores/user";
import LanguageSwitcher from "./LanguageSwitcher";
import ProfilePage from "@/views/ProfilePage";
import { useTranslation } from "react-i18next";
import useScreenshot from "@/hooks/useScreenshot";
import { useFullscreen, useMount, useUpdateEffect } from "ahooks";
import { useGlobalStore } from "@/stores/global";

const RightContent: React.FC = () => {
  const { resetToken } = useUserStore();
  const [profileVisible, setProfileVisible] = useState(false);
  const { t } = useTranslation();
  // 使用一个状态变量存储 content 的引用
  const [content, setContent] = useState<HTMLElement | null>(null);
  
  useMount(() => {
    // 在组件挂载后尝试获取 content
    const mainContent = document.getElementById("main-content");
    if (mainContent) {
      setContent(mainContent);
    }
  }); 

  const [isFullscreen, { toggleFullscreen }] = useFullscreen(content);
  useUpdateEffect(()=>{
    useGlobalStore.setState({fullscreen:isFullscreen});
  },[isFullscreen])
  const logoutHandle = () => {
    resetToken();
  };
  const { downloadScreenshot } = useScreenshot();
  const items: MenuProps["items"] = [
    {
      key: "1",
      label: <span onClick={logoutHandle}>{t("layout.logout")}</span>,
    },
    {
      key: "2",
      label: (
        <span onClick={() => setProfileVisible(true)}>
          {t("layout.profile")}
        </span>
      ),
    },
  ];

  return (
    <Space size={20}>
      <Row gutter={16} align="middle">
        <Col>
          <LanguageSwitcher />
        </Col>
        <Col>
          <BellOutlined  style={{ color: 'white' }} className="text-white text-2xl" />
        </Col>
        <Col>
        <FullscreenOutlined onClick={()=>{
           if (content) {
            toggleFullscreen(); // 调用全屏切换方法
        
          }
        }} style={{ color: 'white' }} className="text-white text-2xl"/>
        </Col>
        <Col>
          <DownloadOutlined
            onClick={() => {
              if (content) {
                downloadScreenshot(content, "screen-shot");
              }
            }}
            style={{ color: 'white' }} className="text-white text-2xl" />
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
        title={t("layout.profile")}
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
