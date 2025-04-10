import React from "react";
import { Card, List, Tag, Spin, Alert, Button } from "antd";
import { ClockCircleOutlined, ReloadOutlined } from "@ant-design/icons";
import { useMount, useRequest } from "ahooks";
import { useTranslation } from "react-i18next";
import axios from "axios";

interface Commit {
  sha: string;
  commit: {
    message: string;
    author: {
      date: string;
    };
  };
}

const fetchCommits = async (): Promise<Commit[]> => {
  const { data } = await axios.get<Commit[]>(
    "https://api.github.com/repos/TianTianHang/latin-google-trends/commits"
  );
  return data;
};

const Updates: React.FC = () => {
  const { t } = useTranslation();
  const { data, loading, error, run } = useRequest(fetchCommits, {
    manual: true,
    cacheKey:"github-commits"
  });
  useMount(() => {
    run();
  });
  const handleReload = () => {
    run();
  };

  if (loading) {
    return (
      <Card title={t("homePage.updates.title")} style={{ marginTop: 16 }}>
        <Spin tip={t("homePage.updates.loading")} />
      </Card>
    );
  }

  if (error) {
    return (
      <Card title={t("homePage.updates.title")} style={{ marginTop: 16 }}>
        <Alert
          message={t("homePage.updates.error")}
          description={error.message}
          type="error"
          showIcon
          action={
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={handleReload}
              style={{ marginTop: 16 }}
            />
          }
        />
      </Card>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toISOString().split("T")[0];
  };

  return (
    <Card title={t("homePage.updates.title")} style={{ marginTop: 16 }}>
      <List
        itemLayout="horizontal"
        dataSource={data?.slice(0, 5) || []}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta
              avatar={
                <Tag icon={<ClockCircleOutlined />} color="processing">
                  {t("homePage.updates.commit")}
                </Tag>
              }
              title={`${t("homePage.updates.commit")} ${item.sha.substring(
                0,
                7
              )}`}
              description={
                <>
                  <div>{item.commit.message.split("\n")[0]}</div>
                  <div style={{ color: "rgba(0,0,0,0.45)" }}>
                    {formatDate(item.commit.author.date)}
                  </div>
                </>
              }
            />
          </List.Item>
        )}
      />
    </Card>
  );
};

export default Updates;
