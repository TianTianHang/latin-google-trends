import React from "react";
import { Modal, Form, Input, Button, Space, Select, DatePicker, message } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { createSubject } from "@/api/subject";
import { useTranslation } from "react-i18next";
import { useUserStore } from "@/stores/user";
import type { RealtimeTask, HistoricalTask, HistoricalTaskStringDate, RealtimeTaskStringDate } from "@/types/subject";
import { countries } from "../countries";

const { Option } = Select;

interface FormValues {
  name: string;
  parameters: Array<RealtimeTask | HistoricalTask>;
  description: string;
}

interface CreateSubjectModalProps {
  visible: boolean;
  onClose: () => void;
}

const CreateSubjectModal: React.FC<CreateSubjectModalProps> = ({ visible, onClose }) => {
  const [form] = Form.useForm<FormValues>();
  const { t } = useTranslation("views");
  const { id } = useUserStore();

  const onFinish = async (values: FormValues) => {
    try {
      const formattedValues = {
        ...values,
        parameters: values.parameters.map((param) => {
          if ("end_date" in param && param.end_date) {
            return {
              ...param,
              start_date:
                "start_date" in param && param.start_date
                  ? param.start_date.format("YYYY-MM-DD")
                  : "",
              end_date:
                "end_date" in param && param.end_date
                  ? param.end_date.format("YYYY-MM-DD")
                  : "",
            } as HistoricalTaskStringDate;
          } else {
            return {
              ...param,
              start_date:
                "start_date" in param && param.start_date
                  ? param.start_date.format("YYYY-MM-DD")
                  : "",
            } as RealtimeTaskStringDate;
          }
        }),
        user_id: id,
      };

      const { subject_id } = await createSubject(formattedValues);
      message.success(t("subject.modal.create.message.createSuccess", { subject_id }));
      form.resetFields();
      onClose();
    } catch (error: unknown) {
      if (error instanceof Error) {
        message.error(t("subject.modal.create.message.createFailed", { error: error.message }));
      } else if (
        typeof error === "object" &&
        error !== null &&
        "response" in error
      ) {
        const err = error as { response?: { data?: { detail?: string } } };
        message.error(
          t("subject.modal.create.message.createFailed", {
            error: err.response?.data?.detail || "Unknown error",
          })
        );
      } else {
        message.error(t("subject.modal.create.message.createFailed", { error: "Unknown error" }));
      }
    }
  };

  return (
    <Modal
      open={visible}
      title={t("subject.modal.create.title")}
      onCancel={onClose}
      footer={null}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
      >
        <Form.Item
          name="name"
          label={t("subject.modal.create.form.name")}
          rules={[
            {
              required: true,
              message: t("subject.modal.create.form.nameRequired"),
            },
          ]}
        >
          <Input placeholder={t("subject.modal.create.form.enterName")} />
        </Form.Item>
        <Form.Item
          name="description"
          label={t("subject.modal.create.form.description")}
          rules={[
            {
              required: false,
            },
          ]}
        >
          <Input.TextArea placeholder={t("subject.modal.create.form.enterDescription")} rows={4} />
        </Form.Item>
        <Form.List name="parameters">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Space
                  key={key}
                  align="baseline"
                  className="flex items-start mb-4"
                  direction="vertical"
                  style={{ width: "100%" }}
                >
                  <Form.Item
                    {...restField}
                    name={[name, "type"]}
                    label={t("subject.modal.create.form.taskType")}
                    rules={[
                      {
                        required: true,
                        message: t("subject.modal.create.form.taskTypeRequired"),
                      },
                    ]}
                  >
                    <Select placeholder={t("subject.modal.create.form.selectTaskType")}>
                      <Option value="realtime">
                        {t("subject.modal.create.form.realtimeTask")}
                      </Option>
                      <Option value="historical">
                        {t("subject.modal.create.form.historicalTask")}
                      </Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    {...restField}
                    name={[name, "data_type"]}
                    label={t("subject.modal.create.form.dataType")}
                    rules={[
                      {
                        required: true,
                        message: t("subject.modal.create.form.dataTypeRequired"),
                      },
                    ]}
                  >
                    <Select placeholder={t("subject.modal.create.form.enterDataType")}>
                      <Option value="time">{t("subject.modal.create.form.timeJob")}</Option>
                      <Option value="region">{t("subject.modal.create.form.regionJob")}</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    {...restField}
                    name={[name, "keywords"]}
                    label={t("subject.modal.create.form.keywords")}
                    rules={[
                      {
                        required: true,
                        message: t("subject.modal.create.form.keywordsRequired"),
                      },
                    ]}
                  >
                    <Select
                      mode="tags"
                      placeholder={t("subject.modal.create.form.enterKeywords")}
                      maxTagCount={5}
                    />
                  </Form.Item>

                  <Form.Item
                    {...restField}
                    name={[name, "geo_code"]}
                    label={t("subject.modal.create.form.geoCode")}
                    rules={[
                      { required: false, message: t("subject.modal.create.form.geoCodeRequired") },
                    ]}
                  >
                    <Select showSearch placeholder={t("subject.modal.create.form.enterGeoCode")}>
                      {countries.map((country: { name: string; code: string }) => (
                        <Option key={country.code} value={country.code}>
                          {country.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    {...restField}
                    name={[name, "start_date"]}
                    label={t("subject.modal.create.form.startDate")}
                    rules={[
                      {
                        required: true,
                        message: t("subject.modal.create.form.startDateRequired"),
                      },
                    ]}
                  >
                    <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
                  </Form.Item>

                  <Form.Item
                    noStyle
                    shouldUpdate={(prevValues, curValues) =>
                      prevValues.parameters?.[name]?.type !==
                      curValues.parameters?.[name]?.type
                    }
                  >
                    {({ getFieldValue }) =>
                      getFieldValue(["parameters", name, "type"]) ===
                      "realtime" ? (
                        <>
                          <Form.Item
                            {...restField}
                            name={[name, "duration"]}
                            label={t("subject.modal.create.form.duration")}
                            rules={[
                              {
                                required: true,
                                message: t("subject.modal.create.form.durationRequired"),
                              },
                            ]}
                          >
                            <Input
                              type="number"
                              placeholder={t("subject.modal.create.form.enterDuration")}
                            />
                          </Form.Item>
                        </>
                      ) : (
                        <>
                          <Form.Item
                            {...restField}
                            name={[name, "end_date"]}
                            label={t("subject.modal.create.form.endDate")}
                            rules={[
                              {
                                required: true,
                                message: t("subject.modal.create.form.endDateRequired"),
                              },
                            ]}
                          >
                            <DatePicker
                              format="YYYY-MM-DD"
                              style={{ width: "100%" }}
                            />
                          </Form.Item>
                        </>
                      )
                    }
                  </Form.Item>

                  <Form.Item
                    {...restField}
                    name={[name, "interval"]}
                    label={t("subject.modal.create.form.interval")}
                  >
                    <Input placeholder={t("subject.modal.create.form.enterInterval")} />
                  </Form.Item>

                  <MinusCircleOutlined
                    onClick={() => remove(name)}
                    className="text-red-500 text-lg hover:text-red-700"
                  />
                </Space>
              ))}

              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                  className="mt-2"
                >
                  {t("subject.modal.create.form.addParam")}
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            className="w-32 h-10 text-lg"
          >
            {t("subject.modal.create.form.submit")}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateSubjectModal;
