import { useSubjectStore } from "@/stores/useSubjectStore";
import { Collapse, Descriptions, Modal, Table } from "antd";
const { Panel } = Collapse;
import { useEffect } from "react";
import type { TimeInterest, RegionInterest } from "@/types/interest";

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
  }, [subject_id]);

  return (
    <Modal
      open={visible}
      onCancel={() => {
        onClose();
      }}
      title={"Detail"}
      width={800}
      footer={null}
    >
      <Collapse accordion>
        {subjectDatas && subjectDatas.map((data, index) => (
          <Panel 
            header={`SubjectData #${index+1}`} 
            key={index}
          >
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Data Type">{data.data_type}</Descriptions.Item>
              <Descriptions.Item label="Timestamp">{data.timestamp}</Descriptions.Item>
            </Descriptions>

            {data.meta.map((meta, metaIndex) => (
              <Collapse key={`meta-collapse-${metaIndex}`} style={{ marginTop: 16 }}>
                <Panel key={`meta-panel-${metaIndex}`} header={`collection #${metaIndex + 1}`}>
                  <Descriptions bordered column={2}>
                    <Descriptions.Item label="Keywords">
                      {meta.keywords.join(', ')}
                    </Descriptions.Item>
                    <Descriptions.Item label="Geo Code">
                      {meta.geo_code==""?"World":meta.geo_code}
                    </Descriptions.Item>
                    <Descriptions.Item label="Timeframe">
                      {`${meta.timeframe_start} - ${meta.timeframe_end}`}
                    </Descriptions.Item>
                  </Descriptions>

                    {data.data_type === 'time' && (
                    <Table
                      dataSource={data.data[metaIndex] as TimeInterest[]}
                      columns={[
                      {
                        title: 'Time [UTC]',
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
                        title: 'geo_name',
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
