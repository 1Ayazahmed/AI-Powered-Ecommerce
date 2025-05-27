import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Table, Select, Spin, Alert, Typography, Progress } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, ShoppingOutlined, UserOutlined, LineChartOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRecommendations, fetchAnalytics } from '../redux/slices/aiSlice';
import { Line, Pie } from '@ant-design/plots';

const { Title, Text } = Typography;
const { Option } = Select;

const AIFeatures = () => {
  const [timeRange, setTimeRange] = useState('week');
  const dispatch = useDispatch();
  const { recommendations, analytics, loading, error } = useSelector((state) => state.ai);

  useEffect(() => {
    dispatch(fetchRecommendations());
    dispatch(fetchAnalytics(timeRange));
  }, [dispatch, timeRange]);

  const handleTimeRangeChange = (value) => {
    setTimeRange(value);
  };

  if (loading.recommendations || loading.analytics) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (error.recommendations || error.analytics) {
    return (
      <div className="p-4">
        <Alert
          message="Error"
          description="Failed to load AI features. Please try again later."
          type="error"
          showIcon
        />
      </div>
    );
  }

  const columns = [
    {
      title: 'Product',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div className="flex items-center">
          <img src={record.image} alt={text} className="w-12 h-12 object-cover rounded mr-3" />
          <div>
            <div className="font-medium">{text}</div>
            <div className="text-gray-500 text-sm">{record.category}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `$${price.toFixed(2)}`,
      sorter: (a, b) => a.price - b.price,
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating) => (
        <div className="flex items-center">
          <Progress
            type="circle"
            percent={rating * 20}
            width={40}
            format={() => rating.toFixed(1)}
            strokeColor={{
              '0%': '#108ee9',
              '100%': '#87d068',
            }}
          />
        </div>
      ),
      sorter: (a, b) => a.rating - b.rating,
    },
  ];

  const salesConfig = {
    data: analytics?.salesForecast || [],
    xField: 'date',
    yField: 'sales',
    smooth: true,
    point: {
      size: 5,
      shape: 'diamond',
    },
    label: {
      style: {
        fill: '#aaa',
      },
    },
    xAxis: {
      type: 'time',
      tickCount: 5,
    },
    yAxis: {
      label: {
        formatter: (v) => `$${v.toFixed(2)}`,
      },
    },
    tooltip: {
      formatter: (datum) => {
        return { name: 'Sales', value: `$${datum.sales.toFixed(2)}` };
      },
    },
    area: {
      style: {
        fill: 'l(270) 0:#ffffff 0.5:#7ec2f3 1:#1890ff',
      },
    },
  };

  const categoryData = Object.entries(analytics?.salesByCategory || {}).map(([category, sales]) => ({
    type: category,
    value: sales,
  }));

  const categoryConfig = {
    data: categoryData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name} {percentage}',
    },
    interactions: [
      {
        type: 'element-active',
      },
    ],
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <Title level={2} className="mb-2">AI Features Dashboard</Title>
        <Text type="secondary">Real-time analytics and insights powered by AI</Text>
      </div>

      <div className="mb-6 flex justify-between items-center">
        <Select
          defaultValue="week"
          style={{ width: 120 }}
          onChange={handleTimeRangeChange}
          className="shadow-sm"
        >
          <Option value="week">Last Week</Option>
          <Option value="month">Last Month</Option>
          <Option value="year">Last Year</Option>
        </Select>
      </div>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={8}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title={<div className="flex items-center"><ShoppingOutlined className="mr-2" /> Total Sales</div>}
              value={analytics?.totalSales || 0}
              precision={2}
              prefix="$"
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title={<div className="flex items-center"><UserOutlined className="mr-2" /> Customer Growth</div>}
              value={analytics?.customerGrowth || 0}
              precision={2}
              suffix="%"
              valueStyle={{
                color: analytics?.customerGrowth >= 0 ? '#3f8600' : '#cf1322',
              }}
              prefix={analytics?.customerGrowth >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title={<div className="flex items-center"><LineChartOutlined className="mr-2" /> Sales Trend</div>}
              value={analytics?.salesTrend || 0}
              precision={2}
              suffix="%"
              valueStyle={{
                color: analytics?.salesTrend >= 0 ? '#3f8600' : '#cf1322',
              }}
              prefix={analytics?.salesTrend >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} lg={16}>
          <Card 
            title="Sales Forecast" 
            className="shadow-sm"
            extra={<Text type="secondary">Next 7 days prediction</Text>}
          >
            <div style={{ height: 400 }}>
              <Line {...salesConfig} />
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card 
            title="Sales by Category" 
            className="shadow-sm"
            extra={<Text type="secondary">Distribution</Text>}
          >
            <div style={{ height: 400 }}>
              <Pie {...categoryConfig} />
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card 
            title="Recommended Products" 
            className="shadow-sm"
            extra={<Text type="secondary">AI-powered recommendations</Text>}
          >
            <Table
              dataSource={recommendations || []}
              columns={columns}
              rowKey="_id"
              pagination={false}
              className="recommendations-table"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AIFeatures; 