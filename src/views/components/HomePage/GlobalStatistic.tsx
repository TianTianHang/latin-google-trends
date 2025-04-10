import React from 'react';
import { Row, Col, Statistic } from 'antd';
import { useRequest } from 'ahooks';
import type { StatisticProps } from 'antd';
import { getTasksStats } from '@/api/tasks';
import { getCollectionsStats } from '@/api/interest';
import { getServices } from '@/api/services';
import { useTranslation } from 'react-i18next';

interface StatisticData {
  historicalTasks: {
    completed: number;
    failed: number;
  };
  scheduledTasks: {
    enabled: number;
  };
  collections: {
    total: number;
    byType: {
      time: number;
      region: number;
    };
    byBinding: {
      bound: number;
      unbound: number;
    };
  };
}

const fetchStatistics = async (): Promise<StatisticData> => {
  // 先获取service实例
  const services = await getServices("trends_collector");
  if (!services || services.services.length === 0) {
    throw new Error("No services found for trends_collector");
  }
  const serviceId = services.services[0].instance_id; // 取第一个service的id

  const [tasksRes, collectionsRes] = await Promise.all([
    getTasksStats(serviceId),
    getCollectionsStats()
  ]);

  return {
    historicalTasks: tasksRes.historical_tasks,
    scheduledTasks: tasksRes.scheduled_tasks,
    collections: {
      total: collectionsRes.total,
      byType: collectionsRes.by_type,
      byBinding: collectionsRes.by_binding
    }
  };
};

const GlobalStatistic: React.FC = () => {
  const { t } = useTranslation();
  const { data, loading, error } = useRequest(fetchStatistics);

  const formatter: StatisticProps['formatter'] = (value) => (
    <span className="text-lg font-medium">{value}</span>
  );

  if (loading) return <div>{t('homePage.statistics.loading')}</div>;
  if (error) return <div>{t('homePage.statistics.error')}</div>;

  return (
    <Row gutter={[16, 16]} className="mb-8">
      <Col xs={24} sm={12} md={6}>
        <Statistic
          title={t('homePage.statistics.completedTasks')}
          value={data?.historicalTasks.completed}
          formatter={formatter}
          className="bg-white p-4 rounded-lg shadow-sm"
        />
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Statistic
          title={t('homePage.statistics.failedTasks')}
          value={data?.historicalTasks.failed}
          formatter={formatter}
          className="bg-white p-4 rounded-lg shadow-sm"
        />
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Statistic
          title={t('homePage.statistics.enabledScheduledTasks')}
          value={data?.scheduledTasks.enabled}
          formatter={formatter}
          className="bg-white p-4 rounded-lg shadow-sm"
        />
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Statistic
          title={t('homePage.statistics.totalInterests')}
          value={data?.collections.total}
          formatter={formatter}
          className="bg-white p-4 rounded-lg shadow-sm"
        />
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Statistic
          title={t('homePage.statistics.timeTypeInterests')}
          value={data?.collections.byType.time}
          formatter={formatter}
          className="bg-white p-4 rounded-lg shadow-sm"
        />
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Statistic
          title={t('homePage.statistics.regionTypeInterests')}
          value={data?.collections.byType.region}
          formatter={formatter}
          className="bg-white p-4 rounded-lg shadow-sm"
        />
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Statistic
          title={t('homePage.statistics.boundInterests')}
          value={data?.collections.byBinding.bound}
          formatter={formatter}
          className="bg-white p-4 rounded-lg shadow-sm"
        />
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Statistic
          title={t('homePage.statistics.unboundInterests')}
          value={data?.collections.byBinding.unbound}
          formatter={formatter}
          className="bg-white p-4 rounded-lg shadow-sm"
        />
      </Col>
    </Row>
  );
};

export default GlobalStatistic;