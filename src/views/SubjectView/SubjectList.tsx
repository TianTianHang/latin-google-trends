import { Card, List, message, Table, Tabs } from "antd";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useSubjectStore } from "@/stores/useSubjectStore";
import { useRequest } from "ahooks";

const SubjectList = () => {
  const { t } = useTranslation("views");
  const { allSubjects, subjectDatas, fetchAllSubjects, selectSubject } = useSubjectStore();

 
  useRequest(
    async () => {
      fetchAllSubjects();
    },
    { refreshDeps: [fetchAllSubjects] ,cacheKey:"allSubjects"}
  );

  const handleShowData = async (subjectId: number) => {
    try {
      await selectSubject(subjectId);
      message.success(t("subject.list.message.dataFetched"));
    } catch (error) {
      message.error(
        t("subject.list.message.fetchFailed", { error: (error as Error).message })
      );
    }
  };

  const generateColumns = (
    dataType: string,
    data: Record<string, unknown>[],
    hiddenColumns: string[] = []
  ) => {
    if (data.length === 0) return [];
    hiddenColumns.push("is_partial")
    const firstRecord = data[0];
    return Object.keys(firstRecord)
      .filter(key => !hiddenColumns.includes(key))
      .map((key) => ({
        title: key,
        dataIndex: key,
        key: key,
      }));
  };
 const sortedSubjects = useMemo(() => {
   return [...allSubjects].sort((a, b) => {
     if (a.status === 'completed' && b.status !== 'completed') return -1;
     if (a.status !== 'completed' && b.status === 'completed') return 1;
     return a.name.localeCompare(b.name);
   });
 }, [allSubjects]);
  return (
    <Card className="h-screen">


      <List
       grid={{ gutter: 16, column: 4 }}
       dataSource={sortedSubjects}
       pagination={{
         pageSize: 8,
         showSizeChanger: false,
         hideOnSinglePage: true
       }}
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
                  : t("subject.list.card.noDescription")}
              </div>
              <div className="p-4">
                <strong>{t("subject.list.card.status")}:</strong> {subject.status}
              </div>
              <div className="p-4">
                <strong>{t("subject.list.card.dataNum")}:</strong> {subject.data_num}
              </div>
              {subject.status === "completed" && (
                <div className="p-4">
                  <button
                    onClick={() => handleShowData(subject.subject_id)}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                  >
                    {t("subject.list.card.showData")}
                  </button>
                </div>
              )}
            </Card>
          </List.Item>
        )}
      />
      <div className="h-1/2">
        {subjectDatas.map((data, i) => (
          <Tabs
            key={i}
            type="card"
            items={data.data.map((subData, j) => ({
              key:`${i}-${j}`,
              label: `data ${j + 1}`,
              children: (
                <Table
                  columns={generateColumns(data.data_type, subData, ['subject_id'])}
                  //@ts-expect-error unknow
                  dataSource={subData}
                  pagination={{ pageSize: 10 }}
                />
              )
            }))}
          />
        ))}
      </div>
    </Card>
  );
};

export default SubjectList;
