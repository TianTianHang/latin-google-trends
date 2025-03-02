import React, { useEffect, useState } from 'react';
import { useTaskStore } from '@/stores/taskStore';
import { Button, Table, Space, Input, Form, Select, DatePicker, Switch } from 'antd';
import { createHistoricalTask, createScheduledTask, terminateHistoricalTask, retryHistoricalTask, toggleScheduledTask } from '@/api/tasks';
import type { HistoricalTaskRequest, ScheduledTaskRequest, HistoricalTaskResponse, ScheduledTaskResponse } from '@/types/tasks';
import dayjs from 'dayjs';
import { ServiceInstance } from '@/types/service';
import { getServices } from '@/api/services';

const { Option } = Select;
const countries = [
  {name:"World",code:""},
  { name: 'Afghanistan', code: 'AF' },
  { name: 'Albania', code: 'AL' },
  { name: 'Algeria', code: 'DZ' },
  { name: 'Andorra', code: 'AD' },
  { name: 'Angola', code: 'AO' },
  { name: 'Antigua and Barbuda', code: 'AG' },
  { name: 'Argentina', code: 'AR' },
  { name: 'Armenia', code: 'AM' },
  { name: 'Australia', code: 'AU' },
  { name: 'Austria', code: 'AT' },
  { name: 'Azerbaijan', code: 'AZ' },
  { name: 'Bahamas', code: 'BS' },
  { name: 'Bahrain', code: 'BH' },
  { name: 'Bangladesh', code: 'BD' },
  { name: 'Barbados', code: 'BB' },
  { name: 'Belarus', code: 'BY' },
  { name: 'Belgium', code: 'BE' },
  { name: 'Belize', code: 'BZ' },
  { name: 'Benin', code: 'BJ' },
  { name: 'Bhutan', code: 'BT' },
  { name: 'Bolivia', code: 'BO' },
  { name: 'Bosnia and Herzegovina', code: 'BA' },
  { name: 'Botswana', code: 'BW' },
  { name: 'Brazil', code: 'BR' },
  { name: 'Brunei', code: 'BN' },]

const TaskManagement: React.FC = () => {
  const { historicalTasks, scheduledTasks, fetchHistoricalTasks, fetchScheduledTasks } = useTaskStore();
  const [serviceInstances, setServiceInstances] = useState<ServiceInstance[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');

  useEffect(() => {
    fetchHistoricalTasks(selectedServiceId);
    fetchScheduledTasks(selectedServiceId);
    fetchServiceInstances();
  }, [fetchHistoricalTasks, fetchScheduledTasks, selectedServiceId]);

  const fetchServiceInstances = async () => {
    try {
      const services = await getServices("trends_collector")
      const trendsCollectorInstances=services.services
      setServiceInstances(trendsCollectorInstances);
      if (trendsCollectorInstances.length > 0) {
        setSelectedServiceId(trendsCollectorInstances[0].instance_id); // 默认选择第一个实例
      }
    } catch (error) {
      console.error('Failed to fetch service instances:', error);
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

  const handleToggleScheduledTask = async (taskId: number, enabled: boolean) => {
    await toggleScheduledTask(selectedServiceId, taskId, enabled);
    fetchScheduledTasks(selectedServiceId);
  };

  const columnsHistorical = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Job Type',
      dataIndex: 'job_type',
      key: 'job_type',
    },
    {
      title: 'Keywords',
      dataIndex: 'keywords',
      key: 'keywords',
      render: (keywords: string[]) => keywords.join(', '),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text: string) => dayjs(text).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: 'Action',
      key: 'action',
      render: (text: string, record: HistoricalTaskResponse) => (
        <Space size="middle">
          {record.status === 'running' && <Button onClick={() => handleTerminateHistoricalTask(record.id)}>Terminate</Button>}
          {record.status === 'failed' && <Button onClick={() => handleRetryHistoricalTask(record.id)}>Retry</Button>}
        </Space>
      ),
    },
  ];

  const columnsScheduled = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Job Type',
      dataIndex: 'job_type',
      key: 'job_type',
    },
    {
      title: 'Keywords',
      dataIndex: 'keywords',
      key: 'keywords',
      render: (keywords: string[]) => keywords.join(', '),
    },
    {
      title: 'Start Date',
      dataIndex: 'start_date',
      key: 'start_date',
      render: (text: string) => dayjs(text).format('YYYY-MM-DD'),
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
    },
    {
      title: 'Enabled',
      key: 'enabled',
      render: (text: string, record: ScheduledTaskResponse) => (
        <Switch
          checked={record.enabled}
          onChange={(checked) => handleToggleScheduledTask(record.id, checked)}
        />
      ),
    },
  ];

  return (
    <div>
      <h2>Service Selection</h2>
      <Select
        value={selectedServiceId}
        onChange={setSelectedServiceId}
        placeholder="Select a service instance"
        style={{ width: 200 }}
      >
        {serviceInstances.map(instance => (
          <Option key={instance.instance_id} value={instance.instance_id}>
            {`${instance.service_name} (${instance.host}:${instance.port})`}
          </Option>
        ))}
      </Select>

      <h2>Historical Tasks</h2>
     
      <Form onFinish={handleCreateHistoricalTask}>
        <Form.Item name="job_type" label="Job Type">
          <Select>
            <Option value="time">Time</Option>
            <Option value="region">Region</Option>
          </Select>
        </Form.Item>
        <Form.Item name="keywords" label="Keywords">
          <Select mode="tags" />
        </Form.Item>
        <Form.Item name="geo_code" label="Geo Code">
        <Select
          showSearch
          placeholder="Select a country"
        >
            {countries.map(country => (
              <Option key={country.code} value={country.code}>
                {country.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="start_date" label="Start Date">
          <DatePicker format="YYYY-MM-DD" />
        </Form.Item>
        <Form.Item name="end_date" label="End Date">
          <DatePicker format="YYYY-MM-DD" />
        </Form.Item>
        <Form.Item name="interval" label="Interval">
          <Select defaultValue="MS">
            <Option value="YS">Yearly</Option>
            <Option value="MS">Monthly</Option>
          </Select>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Create Historical Task
          </Button>
        </Form.Item>
      </Form>
      <Button onClick={()=>fetchHistoricalTasks(selectedServiceId)} style={{ marginBottom: 16 }}>Refresh</Button>
      <Table dataSource={historicalTasks} columns={columnsHistorical} rowKey="id" />

      <h2>Scheduled Tasks</h2>
      
      <Form onFinish={handleCreateScheduledTask}>
        <Form.Item name="job_type" label="Job Type">
          <Select>
            <Option value="time">Time</Option>
            <Option value="region">Region</Option>
          </Select>
        </Form.Item>
        <Form.Item name="keywords" label="Keywords">
          <Select mode="tags" />
        </Form.Item>
        <Form.Item name="geo_code" label="Geo Code">
        <Select
          showSearch
          placeholder="Select a country"
        >
            {countries.map(country => (
              <Option key={country.code} value={country.code}>
                {country.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="cron_expression" label="Cron Expression">
          <Input />
        </Form.Item>
        <Form.Item name="start_date" label="Start Date">
          <DatePicker format="YYYY-MM-DD" />
        </Form.Item>
        <Form.Item name="duration" label="Duration">
          <Input />
        </Form.Item>
        <Form.Item name="interval" label="Interval">
          <Select defaultValue="MS">
            <Option value="YS">Yearly</Option>
            <Option value="MS">Monthly</Option>
          </Select>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Create Scheduled Task
          </Button>
        </Form.Item>
      </Form>
      <Button onClick={()=>fetchScheduledTasks(selectedServiceId)} style={{ marginBottom: 16 }}>Refresh</Button>
      <Table dataSource={scheduledTasks} columns={columnsScheduled} rowKey="id" />
    </div>
  );
};

export default TaskManagement;
