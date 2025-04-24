import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useTaskStore } from "@/stores/taskStore";
import {
  Button,
  Table,
  Space,
  Input,
  Form,
  Select,
  DatePicker,
  Switch,
} from "antd";
import {
  createHistoricalTask,
  createScheduledTask,
  terminateHistoricalTask,
  retryHistoricalTask,
  toggleScheduledTask,
} from "@/api/tasks";
import type {
  HistoricalTaskRequest,
  ScheduledTaskRequest,
  HistoricalTaskResponse,
  ScheduledTaskResponse,
} from "@/types/tasks";
import dayjs from "dayjs";
import { ServiceInstance } from "@/types/service";
import { getServices } from "@/api/services";
import { countries } from "@/views/countries";
import PermissionComp from "@/components/PermissionComp";
import { Timeline, Modal } from "antd";
const { Option } = Select;

const TaskManagement: React.FC = () => {
  const { t } = useTranslation("views");
  const {
    historicalTasks,
    scheduledTasks,
    fetchHistoricalTasks,
    fetchScheduledTasks,
    getHistoricalTasksByScheduleId
  } = useTaskStore();
  const [serviceInstances, setServiceInstances] = useState<ServiceInstance[]>(
    []
  );
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");

  useEffect(() => {
    fetchHistoricalTasks(selectedServiceId);
    fetchScheduledTasks(selectedServiceId);
    fetchServiceInstances();
  }, [fetchHistoricalTasks, fetchScheduledTasks, selectedServiceId]);

  const fetchServiceInstances = async () => {
    try {
      const services = await getServices("trends_collector");
      const trendsCollectorInstances = services.services;
      setServiceInstances(trendsCollectorInstances);
      if (trendsCollectorInstances.length > 0) {
        setSelectedServiceId(trendsCollectorInstances[0].instance_id); // 默认选择第一个实例
      }
    } catch (error) {
      console.error("Failed to fetch service instances:", error);
    }
  };

  const handleCreateHistoricalTask = async (values: HistoricalTaskRequest) => {
    await createHistoricalTask(selectedServiceId, values);
    fetchHistoricalTasks(selectedServiceId);
  };

  const handleCreateScheduledTask = async (values: ScheduledTaskRequest) => {
    await createScheduledTask(selectedServiceId, values);
    fetchScheduledTasks(selectedServiceId);
  };

  const handleTerminateHistoricalTask = async (taskId: number) => {
    await terminateHistoricalTask(selectedServiceId, taskId);
    fetchHistoricalTasks(selectedServiceId);
  };

  const handleRetryHistoricalTask = async (taskId: number) => {
    await retryHistoricalTask(selectedServiceId, taskId);
    fetchHistoricalTasks(selectedServiceId);
  };

  const handleToggleScheduledTask = async (
    taskId: number,
    enabled: boolean
  ) => {
    await toggleScheduledTask(selectedServiceId, taskId, enabled);
    fetchScheduledTasks(selectedServiceId);
  };

  const columnsHistorical = [
    {
      title: t("taskManagement.table.id"),
      dataIndex: "id",
      key: "id",
    },
    {
      title: t("taskManagement.table.jobType"),
      dataIndex: "job_type",
      key: "job_type",
    },
    {
      title: t("taskManagement.table.keywords"),
      dataIndex: "keywords",
      key: "keywords",
      render: (keywords: string[]) => keywords.join(", "),
    },
    {
      title: t("taskManagement.table.geo_code"),
      dataIndex: "geo_code",
      key: "geo_code",
      render: (geoCode: string) =>
        countries.find((country) => country.code === geoCode)?.name || geoCode,
    },
    {
      title: t("taskManagement.table.timeRange"),
      dataIndex: ["start_date", "end_date"],
      key: "timeRange",
      render: (text: string, record: HistoricalTaskResponse) =>
        `${dayjs(record.start_date).format("YYYY-MM-DD")} ~ ${dayjs(record.end_date).format("YYYY-MM-DD")}`,
    },
    {
      title: t("taskManagement.table.status"),
      dataIndex: "status",
      key: "status",
    },
    {
      title: t("taskManagement.table.createdAt"),
      dataIndex: "created_at",
      key: "created_at",
      render: (text: string) => dayjs(text).format("YYYY-MM-DD HH:mm:ss"),
    },
    {
      title: t("taskManagement.table.action"),
      key: "action",
      render: (text: string, record: HistoricalTaskResponse) => (
        <Space size="middle">
          {record.status === "running" && (
            <Button onClick={() => handleTerminateHistoricalTask(record.id)}>
              {t("taskManagement.button.terminate")}
            </Button>
          )}
          {record.status === "failed" && (
            <Button onClick={() => handleRetryHistoricalTask(record.id)}>
              {t("taskManagement.button.retry")}
            </Button>
          )}
        </Space>
      ),
    },
  ].map((column) => {
    if (column.key === "created_at") {
      return {
        ...column,
        sorter: (a: HistoricalTaskResponse, b: HistoricalTaskResponse) =>
          dayjs(a.created_at).unix() - dayjs(b.created_at).unix(),
      };
    }
    return column;
  });

  const [timelineVisible, setTimelineVisible] = useState(false);
  const [timelineTasks, setTimelineTasks] = useState<HistoricalTaskResponse[]>([]);
  const [timelineLoading, setTimelineLoading] = useState(false);

  // 查看历史任务
  const handleShowHistoricalTimeline = async (scheduleId: number) => {
    setTimelineLoading(true);
    try {
      const tasks = await getHistoricalTasksByScheduleId(scheduleId);
      setTimelineTasks(tasks);
      setTimelineVisible(true);
    } finally {
      setTimelineLoading(false);
    }
  };

  const columnsScheduled = [
    {
      title: t("taskManagement.table.id"),
      dataIndex: "id",
      key: "id",
    },
    {
      title: t("taskManagement.table.jobType"),
      dataIndex: "job_type",
      key: "job_type",
    },
    {
      title: t("taskManagement.table.keywords"),
      dataIndex: "keywords",
      key: "keywords",
      render: (keywords: string[]) => keywords.join(", "),
    },
    {
      title: t("taskManagement.table.startDate"),
      dataIndex: "start_date",
      key: "start_date",
      render: (text: string) => dayjs(text).format("YYYY-MM-DD"),
    },
    {
      title: t("taskManagement.table.duration"),
      dataIndex: "duration",
      key: "duration",
    },
    {
      title: t("taskManagement.table.enabled"),
      key: "enabled",
      render: (text: string, record: ScheduledTaskResponse) => (
        <Switch
          checked={record.enabled}
          onChange={(checked) => handleToggleScheduledTask(record.id, checked)}
        />
      ),
    },
    {
      title: t("taskManagement.table.action"),
      key: "action",
      render: (text: string, record: ScheduledTaskResponse) => (
        <Space size="middle">
          <Button onClick={() => handleShowHistoricalTimeline(record.id)}>
            {t("taskManagement.button.viewHistoricalTasks")}
          </Button>
        </Space>
      ),
    },
  ].map((column) => {
    if (column.key === "enabled") {
      return {
        ...column,
        sorter: (a: ScheduledTaskResponse, b: ScheduledTaskResponse) =>
          a.enabled === b.enabled ? 0 : a.enabled ? -1 : 1,
      };
    }
    return column;
  });

  const [historicalSearch, setHistoricalSearch] = useState("");
  const [scheduledSearch, setScheduledSearch] = useState("");

  const filteredHistoricalTasks = historicalTasks
    .filter(
      (task) =>
        task.job_type.toLowerCase().includes(historicalSearch.toLowerCase()) ||
        task.keywords.some((kw) =>
          kw.toLowerCase().includes(historicalSearch.toLowerCase())
        ) ||
        task.status.toLowerCase().includes(historicalSearch.toLowerCase())
    )
    .sort((a, b) => dayjs(b.created_at).unix() - dayjs(a.created_at).unix());

  const filteredScheduledTasks = scheduledTasks
    .filter(
      (task) =>
        task.job_type.toLowerCase().includes(scheduledSearch.toLowerCase()) ||
        task.keywords.some((kw) =>
          kw.toLowerCase().includes(scheduledSearch.toLowerCase())
        )
    )
    .sort((a, b) => (b.enabled === a.enabled ? 0 : b.enabled ? 1 : -1));

  return (
    <div>
      
      <PermissionComp  requireRoles={["admin"]}>
      <h2>{t("taskManagement.title.serviceSelection")}</h2>
      <Select
        value={selectedServiceId}
        onChange={setSelectedServiceId}
        placeholder={t("taskManagement.form.placeholder.serviceInstance")}
        style={{ width: 200 }}
      >
        {serviceInstances.map((instance) => (
          <Option key={instance.instance_id} value={instance.instance_id}>
            {`${instance.service_name} (${instance.host}:${instance.port})`}
          </Option>
        ))}
      </Select>
      </PermissionComp>
      

      <h2>{t("taskManagement.title.historicalTasks")}</h2>

      <Form onFinish={handleCreateHistoricalTask}>
        <Form.Item name="job_type" label={t("taskManagement.form.jobType")}>
          <Select>
            <Option value="time">{t("taskManagement.jobType.time")}</Option>
            <Option value="region">{t("taskManagement.jobType.region")}</Option>
          </Select>
        </Form.Item>
        <Form.Item name="keywords" label={t("taskManagement.form.keywords")}>
          <Select mode="tags" />
        </Form.Item>
        <Form.Item name="geo_code" label={t("taskManagement.form.geoCode")}>
          <Select
            showSearch
            placeholder={t("taskManagement.form.placeholder.country")}
          >
            {countries.map((country) => (
              <Option key={country.code} value={country.code}>
                {country.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="start_date" label={t("taskManagement.form.startDate")}>
          <DatePicker format="YYYY-MM-DD" />
        </Form.Item>
        <Form.Item name="end_date" label={t("taskManagement.form.endDate")}>
          <DatePicker format="YYYY-MM-DD" />
        </Form.Item>
        <Form.Item name="interval" label={t("taskManagement.form.interval")}>
          <Select defaultValue="">
            <Option value="">{t("taskManagement.interval.none")}</Option>
            <Option value="YS">{t("taskManagement.interval.yearly")}</Option>
            <Option value="MS">{t("taskManagement.interval.monthly")}</Option>
          </Select>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            {t("taskManagement.button.createHistoricalTask")}
          </Button>
        </Form.Item>
      </Form>

      <Space>
        <Button
          onClick={() => fetchHistoricalTasks(selectedServiceId)}
          style={{ marginBottom: 16 }}
        >
          {t("taskManagement.button.refresh")}
        </Button>
        <Input.Search
          placeholder={t("taskManagement.search.placeholder")}
          allowClear
          onChange={(e) => setHistoricalSearch(e.target.value)}
          style={{ width: 200, marginBottom: 16 }}
        />
      </Space>

      <Table
        dataSource={filteredHistoricalTasks}
        columns={columnsHistorical}
        rowKey="id"
      />

      <h2>{t("taskManagement.title.scheduledTasks")}</h2>

      <Form onFinish={handleCreateScheduledTask}>
        <Form.Item name="job_type" label={t("taskManagement.form.jobType")}>
          <Select>
            <Option value="time">{t("taskManagement.jobType.time")}</Option>
            <Option value="region">{t("taskManagement.jobType.region")}</Option>
          </Select>
        </Form.Item>
        <Form.Item name="keywords" label={t("taskManagement.form.keywords")}>
          <Select mode="tags" />
        </Form.Item>
        <Form.Item name="geo_code" label={t("taskManagement.form.geoCode")}>
          <Select
            showSearch
            placeholder={t("taskManagement.form.placeholder.country")}
          >
            {countries.map((country) => (
              <Option key={country.code} value={country.code}>
                {country.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="start_date" label={t("taskManagement.form.startDate")}>
          <DatePicker format="YYYY-MM-DD" />
        </Form.Item>
        <Form.Item name="duration" label={t("taskManagement.form.duration")}>
          <Input />
        </Form.Item>
        <Form.Item name="interval" label={t("taskManagement.form.interval")}>
          <Input 
            placeholder={t("taskManagement.form.placeholder.interval")} 
            // 使用正则表达式验证输入格式
            onInput={(e) => {
              const input = (e.target as HTMLInputElement).value;
              if (!/^\d+[hdm]$/.test(input)) {
                // 如果输入不符合格式，清空输入
                (e.target as HTMLInputElement).value = input.replace(/[^0-9hdm]/g, '');
              }
            }}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            {t("taskManagement.button.createScheduledTask")}
          </Button>
        </Form.Item>
      </Form>
      <Space>
        <Button
          onClick={() => fetchScheduledTasks(selectedServiceId)}
          style={{ marginBottom: 16 }}
        >
          {t("taskManagement.button.refresh")}
        </Button>
        <Input.Search
          placeholder={t("taskManagement.search.placeholder")}
          allowClear
          onChange={(e) => setScheduledSearch(e.target.value)}
          style={{ width: 200, marginBottom: 16 }}
        />
      </Space>

      <Table
        dataSource={filteredScheduledTasks}
        columns={columnsScheduled}
        rowKey="id"
      />
      <Modal
        title={t("taskManagement.modal.historicalTimeline") || "历史任务时间线"}
        visible={timelineVisible}
        onCancel={() => setTimelineVisible(false)}
        footer={null}
        width={600}
      >
        <Timeline pending={timelineLoading}>
          {timelineTasks.length === 0 && !timelineLoading && (
            <Timeline.Item>{t("taskManagement.timeline.noData") || "暂无历史任务"}</Timeline.Item>
          )}
          {timelineTasks
            .sort((a, b) => dayjs(b.created_at).unix() - dayjs(a.created_at).unix())
            .map(task => (
              <Timeline.Item key={task.id} color={task.status === "failed" ? "red" : "green"}>
                <div>
                  <strong>{t("taskManagement.table.id")}: </strong>{task.id}<br />
                  <strong>{t("taskManagement.table.status")}: </strong>{task.status}<br />
                  <strong>{t("taskManagement.table.timeRange")}: </strong>
                  {dayjs(task.start_date).format("YYYY-MM-DD")} ~ {dayjs(task.end_date).format("YYYY-MM-DD")}<br />
                  <strong>{t("taskManagement.table.createdAt")}: </strong>
                  {dayjs(task.created_at).format("YYYY-MM-DD HH:mm:ss")}
                </div>
              </Timeline.Item>
            ))}
        </Timeline>
      </Modal>
    </div>
  );
};

export default TaskManagement;
