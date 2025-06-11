import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Select, Typography, Statistic, Table, Tag } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import axios from 'axios';
import Loader from '../Loader';
import Message from '../Message';

const { Title, Text } = Typography;
const { Option } = Select;

const AdvancedAnalytics = () => {
  const [timeRange, setTimeRange] = useState('month');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/analytics/advanced?timeRange=${timeRange}`);
      setAnalytics(response.data);
      console.log('Fetched analytics data:', response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;
  if (error) return <Message variant="danger">{error}</Message>;
  if (!analytics) return null;

  const { salesAnalysis, productPerformance, categoryAnalysis, predictions, marketingInsights } = analytics;

  // Format data for charts
  const salesData = Object.entries(salesAnalysis.dailySales).map(([date, sales]) => ({
    date,
    sales,
    movingAverage: salesAnalysis.movingAverages[date] || 0
  }));

  const predictionData = predictions.nextMonthSales.map(prediction => ({
    date: prediction.date,
    predictedSales: prediction.predictedSales,
    confidence: prediction.confidence
  }));

  // Combine historical and predicted data
  const combinedData = [
    ...salesData.map(item => ({
      ...item,
      type: 'Historical'
    })),
    ...predictionData.map(item => ({
      ...item,
      type: 'Predicted'
    }))
  ];

  return (
    <div className="p-4 md:p-8">
      <Row gutter={[32, 32]} className="mb-8">
        <Col span={24}>
          <Card style={{ backgroundColor: '#1c1c1c', borderColor: '#333' }}>
            <div className="flex justify-between items-center mb-6">
              <Title level={4} style={{ color: '#f0f0f0', margin: 0 }}>Advanced Analytics Dashboard</Title>
              <Select
                value={timeRange}
                onChange={setTimeRange}
                style={{ width: 120 }}
                className="custom-select-blackest-dark"
                styles={{
                  popup: {
                    root: { backgroundColor: '#121212', color: '#e0e0e0' }
                  }
                }}
                classNames={{
                  popup: {
                    root: 'custom-dropdown-blackest-dark'
                  }
                }}
              >
                <Option value="week">Last Week</Option>
                <Option value="month">Last Month</Option>
                <Option value="year">Last Year</Option>
              </Select>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Sales Overview */}
      <Row gutter={[32, 32]} className="mb-8">
        <Col xs={24} sm={12} md={12} lg={8}>
          <Card style={{ backgroundColor: '#1c1c1c', borderColor: '#333', height: '100%' }}>
            <Statistic
              title={<Text style={{ color: '#b0b0b0', fontSize: '16px' }}>Total Sales</Text>}
              value={salesAnalysis.totalSales}
              precision={2}
              prefix="$"
              valueStyle={{ color: '#ffeb3b', fontSize: '24px' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={12} lg={8}>
          <Card style={{ backgroundColor: '#1c1c1c', borderColor: '#333', height: '100%' }}>
            <Statistic
              title={<Text style={{ color: '#b0b0b0', fontSize: '16px' }}>Average Order Value</Text>}
              value={salesAnalysis.averageOrderValue}
              precision={2}
              prefix="$"
              valueStyle={{ color: '#ffeb3b', fontSize: '24px' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={24} md={24} lg={8}>
          <Card style={{ backgroundColor: '#1c1c1c', borderColor: '#333', height: '100%' }}>
            <Statistic
              title={<Text style={{ color: '#b0b0b0', fontSize: '16px' }}>Predicted Growth</Text>}
              value={predictions.predictedGrowth}
              precision={2}
              prefix={predictions.predictedGrowth >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
              suffix="%"
              valueStyle={{ 
                color: predictions.predictedGrowth >= 0 ? '#8bc34a' : '#ef5350',
                fontSize: '24px'
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Sales Trend and Prediction Chart */}
      <Row gutter={[32, 32]} className="mb-8">
        <Col span={24}>
          <Card 
            title={<Title level={5} style={{ color: '#f0f0f0', margin: 0 }}>Sales Trend and Prediction</Title>} 
            style={{ backgroundColor: '#1c1c1c', borderColor: '#333' }}
            styles={{
              body: { padding: '32px' }
            }}
          >
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={combinedData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#424242" />
                <XAxis
                  dataKey="date"
                  stroke="#b0b0b0"
                  tickFormatter={(date) => new Date(date).toLocaleDateString()}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  stroke="#b0b0b0"
                  tickCount={6}
                  tickFormatter={(value) => {
                    if (value >= 1000000) {
                      return `${(value / 1000000).toFixed(1)}M`;
                    } else if (value >= 1000) {
                      return `${(value / 1000).toFixed(1)}K`;
                    }
                    return value;
                  }}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: '#212121', 
                    border: '1px solid #424242',
                    borderRadius: '4px',
                    padding: '12px'
                  }}
                  itemStyle={{ color: '#e0e0e0' }}
                  labelFormatter={(date) => new Date(date).toLocaleDateString()}
                  formatter={(value, name) => [`$${value.toFixed(2)}`, name]}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#64b5f6"
                  name="Historical Sales"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="predictedSales"
                  stroke="#ab47bc"
                  name="Predicted Sales"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Top Products and Marketing Insights */}
      <Row gutter={[32, 32]}>
        <Col xs={24} md={12} lg={12}>
          <Card 
            title={<Title level={5} style={{ color: '#f0f0f0', margin: 0 }}>Top Performing Products</Title>} 
            style={{ backgroundColor: '#1c1c1c', borderColor: '#333', height: '100%' }}
            styles={{
              body: { padding: '32px' }
            }}
          >
            {predictions.topProducts.length > 0 ? (
              <Table
                dataSource={predictions.topProducts.map((product, index) => ({
                  ...product,
                  key: product.name || `product-${index}`
                }))}
                columns={[
                  {
                    title: 'Product',
                    dataIndex: 'name',
                    key: 'name',
                    render: (text) => <span style={{ color: '#e0e0e0' }}>{text}</span>
                  },
                  {
                    title: 'Predicted Sales',
                    dataIndex: 'predictedSales',
                    key: 'predictedSales',
                    render: (value) => {
                      if (typeof value === 'number' && isFinite(value)) {
                        return <span style={{ color: '#e0e0e0' }}>${value.toFixed(2)}</span>;
                      }
                      return <span style={{ color: '#e0e0e0' }}>N/A</span>;
                    },
                  },
                  {
                    title: 'Confidence',
                    dataIndex: 'confidence',
                    key: 'confidence',
                    render: (value) => (
                      <Tag color={value > 70 ? 'green' : value > 40 ? 'orange' : 'red'}>
                        {value}%
                      </Tag>
                    ),
                  },
                ]}
                pagination={false}
                className="ant-table-blackest-dark"
                rowClassName={() => 'ant-table-row-dark'}
              />
            ) : (
              <Message variant="info">No top products found</Message>
            )}
          </Card>
        </Col>
        <Col xs={24} md={12} lg={12}>
          <Card 
            title={<Title level={5} style={{ color: '#f0f0f0', margin: 0 }}>Marketing Recommendations</Title>} 
            style={{ backgroundColor: '#1c1c1c', borderColor: '#333', height: '100%' }}
            bodyStyle={{ padding: '32px' }}
          >
            {marketingInsights.campaignSuggestions && marketingInsights.campaignSuggestions.length > 0 ? (
              <div className="space-y-4">
                {marketingInsights.campaignSuggestions.map((campaign, index) => (
                  <div key={`campaign-${campaign.productName}-${index}`} className="p-4" style={{ backgroundColor: '#212121', borderRadius: '8px' }}>
                    <Title level={5} style={{ color: '#e0e0e0', marginBottom: '12px' }}>{campaign.productName}</Title>
                    <div className="space-y-2">
                      <Text style={{ color: '#b0b0b0', display: 'block' }}>
                        <strong>Campaign Type:</strong> {campaign.suggestedCampaign.type}
                      </Text>
                      <Text style={{ color: '#b0b0b0', display: 'block' }}>
                        <strong>Duration:</strong> {campaign.suggestedCampaign.duration}
                      </Text>
                      <Text style={{ color: '#b0b0b0', display: 'block' }}>
                        <strong>Budget:</strong> ${campaign.suggestedCampaign.budget}
                      </Text>
                      <Text style={{ color: '#b0b0b0', display: 'block' }}>
                        <strong>Target Audience:</strong> {campaign.suggestedCampaign.targetAudience}
                      </Text>
                      <Text style={{ color: '#b0b0b0', display: 'block' }}>
                        <strong>Key Message:</strong> {campaign.suggestedCampaign.keyMessage}
                      </Text>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: '#b0b0b0', textAlign: 'center', padding: '20px' }}>
                No marketing recommendations available for this period.
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Category Analysis */}
      <Row gutter={[16, 16]} className="mt-4 mb-4">
        <Col span={24}>
          <Card title={<Title level={5} style={{ color: '#f0f0f0' }}>Category Performance</Title>} style={{ backgroundColor: '#1c1c1c', borderColor: '#333' }}>
            <Table
              dataSource={Object.entries(categoryAnalysis).map(([category, data], index) => ({
                key: category || `category-${index}`,
                category,
                ...data
              }))}
              columns={[
                {
                  title: 'Category',
                  dataIndex: 'category',
                  key: 'category',
                },
                {
                  title: 'Total Sales',
                  dataIndex: 'totalSales',
                  key: 'totalSales',
                  render: (value) => `$${value.toFixed(2)}`,
                },
                {
                  title: 'Products',
                  dataIndex: 'productCount',
                  key: 'productCount',
                },
                {
                  title: 'Growth Rate',
                  dataIndex: 'growthRate',
                  key: 'growthRate',
                  render: (value) => (
                    <Tag color={value > 0 ? 'green' : 'red'}>
                      {value > 0 ? '+' : ''}{typeof value === 'number' && isFinite(value) ? value.toFixed(2) : 'N/A'}%
                    </Tag>
                  ),
                },
              ]}
              className="ant-table-blackest-dark"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdvancedAnalytics; 