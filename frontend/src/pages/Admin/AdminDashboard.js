import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Select } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { Line } from '@ant-design/plots';
import axios from 'axios';

const { Option } = Select;

const AdminDashboard = () => {
  const [timeRange, setTimeRange] = useState('week');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/analytics?timeRange=${timeRange}`);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const config = {
    data: analytics?.salesData || [],
    xField: 'date',
    yField: 'value',
    seriesField: 'type',
    yAxis: {
      label: {
        formatter: (v) => `$${v}`,
      },
    },
    legend: {
      position: 'top',
    },
    smooth: true,
    animation: {
      appear: {
        animation: 'path-in',
        duration: 1000,
      },
    },
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Select 
          value={timeRange} 
          onChange={setTimeRange}
          className="w-32"
        >
          <Option value="week">Last Week</Option>
          <Option value="month">Last Month</Option>
          <Option value="year">Last Year</Option>
        </Select>
      </div>

      <Row gutter={[16, 16]} className="mb-6">
        <Col span={6}>
          <Card loading={loading}>
            <Statistic
              title="Total Sales"
              value={analytics?.predictedSales || 0}
              precision={2}
              prefix="$"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card loading={loading}>
            <Statistic
              title="Sales Trend"
              value={analytics?.salesTrend || 0}
              precision={2}
              valueStyle={{ color: analytics?.salesTrend >= 0 ? '#3f8600' : '#cf1322' }}
              prefix={analytics?.salesTrend >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
              suffix="%"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card loading={loading}>
            <Statistic
              title="Customer Growth"
              value={analytics?.customerGrowth || 0}
              precision={2}
              valueStyle={{ color: analytics?.customerGrowth >= 0 ? '#3f8600' : '#cf1322' }}
              prefix={analytics?.customerGrowth >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
              suffix="%"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card loading={loading}>
            <Statistic
              title="Top Category"
              value={analytics?.popularCategories?.[0]?.name || 'N/A'}
              suffix={analytics?.popularCategories?.[0] ? `(${analytics.popularCategories[0].percentage}%)` : ''}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={16}>
          <Card title="Sales Forecast" loading={loading}>
            <Line {...config} />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="Popular Categories" loading={loading}>
            {analytics?.popularCategories?.map((category, index) => (
              <div key={index} className="mb-4">
                <div className="flex justify-between mb-1">
                  <span>{category.name}</span>
                  <span>{category.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${category.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard; 