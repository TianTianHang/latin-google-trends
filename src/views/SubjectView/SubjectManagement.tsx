import { Button, Space, Card, Table } from "antd";
import { useTranslation } from "react-i18next";

import CreateSubjectModal from "./CreateSubjectModal";
import { useEffect, useState } from "react";
import { useSubjectStore } from "@/stores/useSubjectStore";
import DetailSubjectModal from "./DetailSubjectModal";
import { ListSubjectResponse } from "@/types/subject";

const SubjectManagement = () => {
  const { t } = useTranslation();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const { allSubjects, fetchAllSubjects } = useSubjectStore();
  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };
  
  useEffect(() => {
      fetchAllSubjects();
    }, [fetchAllSubjects]);
    
  return (
    <Card title={t("subject.managementTitle")}>
      <Button type="primary" onClick={showModal}>
        {t("subject.create")}
      </Button>
      <CreateSubjectModal visible={isModalVisible} onClose={handleCancel} />
      <DetailSubjectModal 
        visible={detailModalVisible} 
        subject_id={selectedSubjectId} 
        onClose={() => setDetailModalVisible(false)} 
      />
      <Table
        dataSource={allSubjects}
        columns={[
          {
            title: t("subject.name"),
            dataIndex: "name",
            key: "name",
          },
          {
            title: t("subject.description"),
            dataIndex: "description",
            key: "description",
            render: (text) => text || t("subject.noDescription"),
          },
          {
            title: t("subject.status"),
            dataIndex: "status",
            key: "status",
            render: (status) => (
              <span
                style={{
                  color:
                    status === "completed"
                      ? "green"
                      : status === "failed"
                      ? "red"
                      : "orange",
                }}
              >
                {status}
              </span>
            ),
          },
          {
            title: t("subject.dataNum"),
            dataIndex: "data_num",
            key: "data_num",
          },
          {
            title: t("subject.actions"),
            key: "actions",
            render: (value:ListSubjectResponse) => (
              <Space size="middle">
                <Button 
                  type="primary"
                  onClick={() => {
                    setSelectedSubjectId(value.subject_id);
                    setDetailModalVisible(true);
                  }}
                >
                  {t("subject.details")}
                </Button>
                <Button type="link">{t("subject.edit")}</Button>
                <Button type="link" danger>
                  {t("subject.delete")}
                </Button>
              </Space>
            ),
          },
        ]}
      />
    </Card>
  );
};

export default SubjectManagement;
