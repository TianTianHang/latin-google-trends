import { useSubjectStore } from "@/stores/useSubjectStore";
import { Collapse, Descriptions, Modal, Table } from "antd";
const { Panel } = Collapse;
import { useEffect } from "react";
import type { TimeInterest, RegionInterest } from "@/types/interest";
import { useTranslation } from "react-i18next";

interface DetailSubjectModalProps {
    visible: boolean;
    subject_id: number|null;
    onClose: () => void;
}

const DetailSubjectModal = ({ visible, subject_id, onClose }: DetailSubjectModalProps) => {
  const { subjectDatas, selectSubject } = useSubjectStore();
  
  useEffect(() => {
    if(!subject_id) return
    selectSubject(subject_id);
  }, [selectSubject, subject_id]);

  const { t } = useTranslation("views");
  
  return (
    <Modal
      open={visible}
      onCancel={() => {
        onClose();
      }}
      title={t("subject.modal.detail.title")}
      width={800}
      footer={null}
    >
      <Collapse accordion>
        {subjectDatas && subjectDatas.map((data, index) => (
          <Panel
            header={t("subject.modal.detail.panel.subjectDataHeader", {index: index+1})}
            key={index}
          >
            <Descriptions bordered column={2}>
              <Descriptions.Item label={t("subject.modal.detail.panel.dataType")}>{data.data_type}</Descriptions.Item>
              <Descriptions.Item label={t("subject.modal.detail.panel.timestamp")}>{data.timestamp}</Descriptions.Item>
            </Descriptions>

            {data.meta.map((meta, metaIndex) => (
              <Collapse key={`meta-collapse-${metaIndex}`} style={{ marginTop: 16 }}>
                <Panel key={`meta-panel-${metaIndex}`} header={t("subject.modal.detail.panel.collectionHeader", {index: metaIndex + 1})}>
                  <Descriptions bordered column={2}>
                    <Descriptions.Item label={t("subject.modal.detail.panel.keywords")}>
                      {meta.keywords.join(', ')}
                    </Descriptions.Item>
                    <Descriptions.Item label={t("subject.modal.detail.panel.geoCode")}>
                      {meta.geo_code==""?"World":meta.geo_code}
                    </Descriptions.Item>
                    <Descriptions.Item label={t("subject.modal.detail.panel.timeframe")}>
                      {`${meta.timeframe_start} - ${meta.timeframe_end}`}
                    </Descriptions.Item>
                  </Descriptions>

                    {data.data_type === 'time' && (
                    <Table
                      dataSource={data.data[metaIndex] as TimeInterest[]}
                      columns={[
                      {
                        title: t("subject.modal.detail.panel.timeUTC"),
                        dataIndex: 'time_utc',
                        key: 'time_utc',
                      },
                      ...meta.keywords.map((keyword)=>({
                        title: keyword,
                        dataIndex: keyword,
                        key: keyword,
                      }))
                      ]}
                      pagination={{ pageSize: 10 }}
                      scroll={{ y: 240 }}
                      style={{ marginTop: 16 }}
                    />
                    )}

                    {data.data_type === 'region' && (
                    <Table
                      dataSource={data.data[metaIndex] as RegionInterest[]}
                      columns={[
                      {
                        title: t("subject.modal.detail.panel.geoName"),
                        dataIndex: 'geo_name',
                        key: 'geo_name',
                      },
                      {
                        title: 'geo_code',
                        dataIndex: 'geo_code',
                        key: 'geo_code',
                      },
                      ...meta.keywords.map((keyword)=>({
                        title: keyword,
                        dataIndex: keyword,
                        key: keyword,
                      }))
                      ]}
                      pagination={{ pageSize: 10 }}
                      scroll={{ y: 240 }}
                      style={{ marginTop: 16 }}
                    />
                    )}
                </Panel>
              </Collapse>
            ))}
          </Panel>
        ))}
      </Collapse>
    </Modal>
  );
};

export default DetailSubjectModal;
