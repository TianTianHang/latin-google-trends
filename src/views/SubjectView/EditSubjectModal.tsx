import { getCollectionsBind, getCollectionsNotBind } from "@/api/interest";
import { updateSubjectData } from "@/api/subject";
import { useSubjectStore } from "@/stores/useSubjectStore";
import { Button, message, Modal, Select, Spin, Transfer } from "antd";
import { useTranslation } from "react-i18next";
import { TransferDirection } from "antd/es/transfer";
import { TransferKey } from "antd/es/transfer/interface";
import { Key, useEffect, useState } from "react";
import { useRequest } from "ahooks";
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
  const { t } = useTranslation("views");
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
    loading: isNotBindLoading,
    error: isNotBindError,
  } = useRequest(
    () =>
      getCollectionsNotBind({
        interest_type: selectType!,
        skip: 0,
        limit: 1000,
      }),
    {
      refreshDeps: [selectedSubjectData],
    }
  );

  const {
    data: bindCollections = [],
    loading: isBindLoading,
    error: isBindError,
  } = useRequest(
    async () => {
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
    {
      refreshDeps: [selectedSubjectData],
    }
  );

  useEffect(() => {
    if (!subject_id || !visible) return;
    selectSubject(subject_id);
    setSelectedSubjectData(subjectDatas?.[0]?.id ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectSubject, subject_id, visible]);

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
      message.warning(t("subject.modal.edit.form.error"));
    }
  };
  const filterOption = (
    inputValue: string,
    option: {
      key: Key;
      title: string;
      description: string;
      meta: SubjectDataMeta;
    }
  ) => {
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
      title={t("subject.modal.edit.title")}
      width={800}
      footer={[
        <Button
          type="primary"
          onClick={() => {
            handleSave();
          }}
        >
          {t("subject.modal.edit.form.save")}
        </Button>,
      ]}
    >
      <div style={{ marginBottom: 16 }}>
        <Select
          style={{ width: "100%" }}
          placeholder={t("subject.modal.edit.form.selectSubject")}
          value={selectedSubjectData}
          onChange={handleSubjectDataChange}
          options={subjectDatas.map((subject) => ({
            label: `${subject.data_type}-${subject.id}-subjectData`,
            value: subject.id,
          }))}
        />
      </div>
      <Spin spinning={isNotBindLoading || isBindLoading}>
        {isNotBindError || isBindError ? (
          <div>{t("subject.modal.edit.form.loadingError")}</div>
        ) : (
          <Transfer
            showSearch
            filterOption={filterOption}
            dataSource={[...notBindCollections, ...bindCollections].map(
              (collection) => ({
                key: collection.id,
                title: `${collection.id} - ${collection.interest_type}`,
                description: `GeoCode: ${
                  collection.meta_data.geo_code != ""
                    ? collection.meta_data.geo_code
                    : "World"
                } Keywords: ${collection.meta_data.keywords} Timeframe: ${
                  collection.meta_data.timeframe_start
                }-${collection.meta_data.timeframe_end}`,
                meta: collection.meta_data,
              })
            )}
            targetKeys={selectedCollections}
            onChange={handleTransferChange}
            pagination
            titles={[
              t("subject.modal.edit.transfer.notBind"),
              t("subject.modal.edit.transfer.bind"),
            ]}
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
