import React, { useEffect } from "react";
import { Card, List, message, Table } from "antd";
import { useTranslation } from "react-i18next";
import { useSubjectStore } from "@/stores/useSubjectStore";

const SubjectList = () => {
  const { t } = useTranslation();
  const { allSubjects, subjectData, fetchAllSubjects, selectSubject } = useSubjectStore();

  useEffect(() => {
    fetchAllSubjects();
  }, [fetchAllSubjects]);

  const handleShowData = async (subjectId: number) => {
    try {
      await selectSubject(subjectId);
      message.success(t("subject.dataFetched"));
    } catch (error) {
      message.error(
        t("subject.fetchDataFailed", { error: (error as Error).message })
      );
    }
  };

  const generateColumns = (dataType: string, data: Record<string, unknown>[]) => {
    if (data.length === 0) return [];
    
    const firstRecord = data[0];
    return Object.keys(firstRecord).map((key) => ({
      title: key,
      dataIndex: key,
      key: key,
    }));
  };

  return (
    <Card className="h-screen">
      <List
        grid={{ gutter: 16, column: 4 }}
        dataSource={allSubjects}
        renderItem={(subject) => (
          <List.Item>
            <Card
              title={subject.name}
              className={`h-half bg-white shadow-md rounded-lg overflow-hidden ${
                subject.status === "completed"
                  ? "border-green-500"
                  : subject.status === "failed"
                  ? "border-red-500"
                  : "border-yellow-500"
              }`}
            >
              <div className="p-4">
                {subject.description
                  ? subject.description
                  : t("subject.noDescription")}
              </div>
              <div className="p-4">
                <strong>{t("subject.status")}:</strong> {subject.status}
              </div>
              <div className="p-4">
                <strong>{t("subject.dataNum")}:</strong> {subject.data_num}
              </div>
              {subject.status === "completed" && (
                <div className="p-4">
                  <button
                    onClick={() => handleShowData(subject.subject_id)}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                  >
                    {t("subject.showData")}
                  </button>
                </div>
              )}
            </Card>
          </List.Item>
        )}
      />
      <div className="h-1/2">
        {subjectData.map((data, i) => (
          <Table
            key={i}
            columns={generateColumns(data.data_type, data.data.flat())}
            dataSource={data.data.flat()}
            rowKey="subject_id"
            pagination={{ pageSize: 10 }}
          />
        ))}
      </div>
    </Card>
  );
};

export default SubjectList;
