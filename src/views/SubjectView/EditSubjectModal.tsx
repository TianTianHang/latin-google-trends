import { getCollectionsBind, getCollectionsNotBind } from "@/api/interest";
import { updateSubjectData } from "@/api/subject";
import { useSubjectStore } from "@/stores/useSubjectStore";
import { Button, message, Modal, Select, Spin, Transfer } from "antd";
import { TransferDirection } from "antd/es/transfer";
import { TransferKey } from "antd/es/transfer/interface";
import { Key, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CollectionResponse } from "@/types/interest";
import { SubjectDataMeta } from "@/types/subject";
interface EditSubjectModalProps {
  visible: boolean;
  subject_id: number | null;
  onClose: () => void;
}
const EditSubjectModal = ({
  visible,
  subject_id,
  onClose,
}: EditSubjectModalProps) => {
  const { subjectDatas, selectSubject } = useSubjectStore();
  const [selectedSubjectData, setSelectedSubjectData] = useState<number | null>(
    null
  );
  const [selectType, setSelectType] = useState<string | null>(null);
  const [selectedCollections, setSelectedCollections] = useState<number[]>([]);
  const [addedCollections, setAddedCollections] = useState<number[]>([]);
  const [removedCollections, setRemovedCollections] = useState<number[]>([]);



  const {
    data: notBindCollections = [],
    isLoading: isNotBindLoading,
    isError: isNotBindError,
  } = useQuery({
    queryKey: ["notBindCollections", selectType],
    queryFn: () =>
      getCollectionsNotBind({
        interest_type: selectType!,
        skip: 0,
        limit: 1000,
      }),
    enabled: !!selectType,
  });

  const {
    data: bindCollections = [],
    isLoading: isBindLoading,
    isError: isBindError,
  } = useQuery({
    queryKey: ["bindCollections", selectedSubjectData],
    queryFn: async () => {
      const t = subjectDatas.find((s) => s.id === selectedSubjectData);
      const bindCollections = await getCollectionsBind({
        subject_data_ids: [t!.id].join(","),
        skip: 0,
        limit: 100,
      });
      setSelectedCollections(
        bindCollections.map((i: CollectionResponse) => i.id)
      );
      return bindCollections;
    },
    enabled: !!selectedSubjectData,
  });

  useEffect(() => {
    if (!subject_id || !visible) return;
    selectSubject(subject_id);
    setSelectedSubjectData(subjectDatas?.[0]?.id ?? null);
  }, [subject_id, visible]);

  const handleSubjectDataChange = (value: number) => {
    const t = subjectDatas.find((s) => s.id === value);
    if (t) {
      setSelectedSubjectData(value);
      setSelectType(t.data_type);
    }
  };

  const handleTransferChange = (
    targetKeys: TransferKey[],
    direction: TransferDirection,
    moveKeys: TransferKey[]
  ) => {
    if (direction === "right") {
      setSelectedCollections((prev) => [...prev, ...(moveKeys as number[])]);
      setAddedCollections((prev) => [...prev, ...(moveKeys as number[])]);
      setRemovedCollections((prev) =>
        prev.filter((key) => !moveKeys.includes(key))
      );
    } else if (direction === "left") {
      setSelectedCollections((prev) =>
        prev.filter((key) => !moveKeys.includes(key as number))
      );
      setRemovedCollections((prev) => [...prev, ...(moveKeys as number[])]);
      setAddedCollections((prev) =>
        prev.filter((key) => !moveKeys.includes(key))
      );
    }
  };
  const handleSave = () => {
    if (selectedSubjectData !== null) {
      updateSubjectData(selectedSubjectData, {
        add_collection_ids: addedCollections,
        delete_collection_ids: removedCollections,
      });
      onClose();
    } else {
      message.warning("error");
    }
  };
  const filterOption = (inputValue: string, option: { key: Key; title: string; description: string; meta: SubjectDataMeta }) => {
    return (
      option.meta.keywords.some((keyword) => keyword.includes(inputValue)) ||
      option.meta.geo_code.includes(inputValue) ||
      option.meta.timeframe_start.includes(inputValue) ||
      option.meta.timeframe_end.includes(inputValue)
    );
  };
    
  return (
    <Modal
      open={visible}
      onCancel={() => {
        onClose();
      }}
      title={"Edit"}
      width={800}
      footer={[
        <Button
          type="primary"
          onClick={() => {
            handleSave();
          }}
        >
          Save
        </Button>,
      ]}
    >
      <div style={{ marginBottom: 16 }}>
        <Select
          style={{ width: "100%" }}
          placeholder="Select subject"
          value={selectedSubjectData}
          onChange={handleSubjectDataChange}
          options={subjectDatas.map((subject) => ({
            label: `${subject.data_type}-${subject.id}`,
            value: subject.id,
          }))}
        />
      </div>
      <Spin spinning={isNotBindLoading || isBindLoading}>
        {isNotBindError || isBindError ? (
          <div>Error loading collections</div>
        ) : (
          <Transfer
            showSearch
            filterOption={filterOption}
            dataSource={[...notBindCollections, ...bindCollections].map(
              (collection) => ({
                key: collection.id,
                title: `${collection.id} - ${collection.interest_type}`,
                description: `GeoCode: ${collection.meta_data.geo_code} Keywords: ${collection.meta_data.keywords} Timeframe: ${collection.meta_data.timeframe_start}-${collection.meta_data.timeframe_end}`,
                meta:collection.meta_data
              })
            )}
            targetKeys={selectedCollections}
            onChange={handleTransferChange}
            pagination
            titles={["notBind","Bind"]}
            listStyle={{
              width: 300,
              height: 300,
            }}
            render={(item) => `${item.title}  ${item.description}`}
          />
        )}
      </Spin>
    </Modal>
  );
};
export default EditSubjectModal;
