import {
  Form,
  Input,
  Button,
  Space,
  Card,
  message,
  Typography,
  Select,
  DatePicker,
} from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { createSubject } from "@/api/subject";
import { useTranslation } from "react-i18next";
import { useUserStore } from "@/stores/user";
import { useNavigate } from "react-router-dom";
import type { RealtimeTask, HistoricalTask, HistoricalTaskStringDate, RealtimeTaskStringDate } from "@/types/subject";
const countries = [
  { name: "World", code: "World" },
  { name: "Afghanistan", code: "AF" },
  { name: "Albania", code: "AL" },
  { name: "Algeria", code: "DZ" },
  { name: "Andorra", code: "AD" },
  { name: "Angola", code: "AO" },
  { name: "Antigua and Barbuda", code: "AG" },
  { name: "Argentina", code: "AR" },
  { name: "Armenia", code: "AM" },
  { name: "Australia", code: "AU" },
  { name: "Austria", code: "AT" },
  { name: "Azerbaijan", code: "AZ" },
  { name: "Bahamas", code: "BS" },
  { name: "Bahrain", code: "BH" },
  { name: "Bangladesh", code: "BD" },
  { name: "Barbados", code: "BB" },
  { name: "Belarus", code: "BY" },
  { name: "Belgium", code: "BE" },
  { name: "Belize", code: "BZ" },
  { name: "Benin", code: "BJ" },
  { name: "Bhutan", code: "BT" },
  { name: "Bolivia", code: "BO" },
  { name: "Bosnia and Herzegovina", code: "BA" },
  { name: "Botswana", code: "BW" },
  { name: "Brazil", code: "BR" },
  { name: "Brunei", code: "BN" },
];

const { Option } = Select;

interface FormValues {
  name:string;
  parameters: Array<RealtimeTask | HistoricalTask>;
  description:string;
}

const SubjectCreateView = () => {
  const [form] = Form.useForm<FormValues>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useUserStore();

  // ...

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
      message.success(t("subject.createSuccess", { subject_id }));
      form.resetFields();
    } catch (error: unknown) {
      if (error instanceof Error) {
        message.error(t("subject.createFailed", { error: error.message }));
      } else if (
        typeof error === "object" &&
        error !== null &&
        "response" in error
      ) {
        const err = error as { response?: { data?: { detail?: string } } };
        message.error(
          t("subject.createFailed", {
            error: err.response?.data?.detail || "Unknown error",
          })
        );
      } else {
        message.error(t("subject.createFailed", { error: "Unknown error" }));
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card
        title={
          <Typography.Title level={3} className="mb-0">
            {t("subject.createTitle")}
          </Typography.Title>
        }
        extra={
          <Typography.Text type="secondary">
            {t("subject.createSubTitle")}
          </Typography.Text>
        }
        className="mb-6"
      />
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
      >
        <Form.Item
          name="name"
          label={t("subject.name")}
          rules={[
            {
              required: true,
              message: t("subject.nameRequired"),
            },
          ]}
        >
          <Input placeholder={t("subject.enterName")} />
        </Form.Item>
        <Form.Item
          name="description"
          label={t("subject.description")}
          rules={[
            {
              required: false,
            },
          ]}
        >
          <Input.TextArea placeholder={t("subject.enterDescription")} rows={4} />
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
                    label={t("subject.taskType")}
                    rules={[
                      {
                        required: true,
                        message: t("subject.taskTypeRequired"),
                      },
                    ]}
                  >
                    <Select placeholder={t("subject.selectTaskType")}>
                      <Option value="realtime">
                        {t("subject.realtimeTask")}
                      </Option>
                      <Option value="historical">
                        {t("subject.historicalTask")}
                      </Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    {...restField}
                    name={[name, "data_type"]}
                    label={t("subject.dataType")}
                    rules={[
                      {
                        required: true,
                        message: t("subject.dataTypeRequired"),
                      },
                    ]}
                  >
                    <Select placeholder={t("subject.enterDataType")}>
                      <Option value="time">{t("subject.timeJob")}</Option>
                      <Option value="region">{t("subject.regionJob")}</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    {...restField}
                    name={[name, "keywords"]}
                    label={t("subject.keywords")}
                    rules={[
                      {
                        required: true,
                        message: t("subject.keywordsRequired"),
                      },
                    ]}
                  >
                    <Select
                      mode="tags"
                      placeholder={t("subject.enterKeywords")}
                      maxTagCount={5}
                    />
                  </Form.Item>

                  <Form.Item
                    {...restField}
                    name={[name, "geo_code"]}
                    label={t("subject.geoCode")}
                    rules={[
                      { required: true, message: t("subject.geoCodeRequired") },
                    ]}
                  >
                    <Select showSearch placeholder={t("subject.enterGeoCode")}>
                      {countries.map((country) => (
                        <Option key={country.code} value={country.code}>
                          {country.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    {...restField}
                    name={[name, "start_date"]}
                    label={t("subject.startDate")}
                    rules={[
                      {
                        required: true,
                        message: t("subject.startDateRequired"),
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
                            label={t("subject.duration")}
                            rules={[
                              {
                                required: true,
                                message: t("subject.durationRequired"),
                              },
                            ]}
                          >
                            <Input
                              type="number"
                              placeholder={t("subject.enterDuration")}
                            />
                          </Form.Item>
                        </>
                      ) : (
                        <>
                          <Form.Item
                            {...restField}
                            name={[name, "end_date"]}
                            label={t("subject.endDate")}
                            rules={[
                              {
                                required: true,
                                message: t("subject.endDateRequired"),
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
                    label={t("subject.interval")}
                  >
                    <Input placeholder={t("subject.enterInterval")} />
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
                  {t("subject.addParam")}
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
            {t("subject.submit")}
          </Button>
        </Form.Item>
      </Form>
      <Button type="link" onClick={() => navigate('/subject/list')}>
        {t("subject.viewAll")}
      </Button>
    </div>
  );
};

export default SubjectCreateView;
