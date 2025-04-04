import { Button, Space, Card, Table } from "antd";
import { useTranslation } from "react-i18next";

import CreateSubjectModal from "./CreateSubjectModal";
import { useEffect, useState } from "react";
import { useSubjectStore } from "@/stores/useSubjectStore";
import DetailSubjectModal from "./DetailSubjectModal";
import { ListSubjectResponse } from "@/types/subject";
import EditSubjectModal from "./EditSubjectModal";

const SubjectManagement = () => {
  const { t } = useTranslation("views");

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
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
    <Card title={t("subject.management.title")}>
      <Button type="primary" onClick={showModal}>
        {t("subject.management.button.create")}
      </Button>
      <CreateSubjectModal visible={isModalVisible} onClose={handleCancel} />
      <DetailSubjectModal 
        visible={detailModalVisible} 
        subject_id={selectedSubjectId} 
        onClose={() => setDetailModalVisible(false)} 
      />
      <EditSubjectModal
         visible={editModalVisible} 
         subject_id={selectedSubjectId} 
         onClose={() => setEditModalVisible(false)} 
      />
      <Table
        dataSource={allSubjects}
        rowKey="subject_id"
        columns={[
          {
            title: t("subject.management.name"),
            dataIndex: "name",
            key: "name",
          },
          {
            title: t("subject.management.description"),
            dataIndex: "description",
            key: "description",
            render: (text) => text || t("subject.noDescription"),
          },
          {
            title: t("subject.management.status"),
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
            title: t("subject.management.dataNum"),
            dataIndex: "data_num",
            key: "data_num",
          },
          {
            title: t("subject.management.actions"),
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
                  {t("subject.management.button.details")}
                </Button>
                <Button type="primary"
                onClick={() => {
                  setSelectedSubjectId(value.subject_id);
                  setEditModalVisible(true);
                }}
                >{t("subject.management.button.edit")}</Button>
                <Button type="link" danger>
                  {t("subject.management.button.delete")}
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
