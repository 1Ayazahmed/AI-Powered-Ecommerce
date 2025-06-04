import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Select, Input, Button, Typography } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, SearchOutlined } from '@ant-design/icons';
import { Line } from '@ant-design/plots';
import axios from 'axios';
import { LineChart, Line as RechartsLine, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const { Option } = Select;
const { Title, Text } = Typography;
const { Search } = Input;

const AdminDashboard = () => {
  const [timeRange, setTimeRange] = useState('week');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [predictionError, setPredictionError] = useState(null);
  const [purchaseHistoryData, setPurchaseHistoryData] = useState([]);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  useEffect(() => {
    fetchAnalytics();
    fetchUsers();
  }, [timeRange]);

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const response = await axios.get('http://localhost:5001/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setUsersLoading(false);
    }
  };

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

  const fetchPrediction = async () => {
    if (!userId) {
      setPrediction(null);
      setPredictionError('Please enter a User ID.');
      setPurchaseHistoryData([]);
      return;
    }
    setPredictionLoading(true);
    setPredictionError(null);
    setPrediction(null);
    setPurchaseHistoryData([]);
    try {
      const response = await axios.post('http://localhost:5001/predict', { userId });
      setPrediction(response.data);
      // Format purchase history data for the chart
      if (response.data?.purchase_history) {
        const formattedHistory = response.data.purchase_history.map(item => ({
          date: new Date(item.date).toLocaleDateString(),
          total: item.total
        })).sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort by date
        setPurchaseHistoryData(formattedHistory);
      }

    } catch (error) {
      console.error('Error fetching prediction:', error);
      setPredictionError('Failed to fetch prediction. Please check the User ID.');
      setPrediction(null);
      setPurchaseHistoryData([]);
    } finally {
      setPredictionLoading(false);
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

      {/* User Prediction Section */}
      <Card title="User Purchase Prediction" className="mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <Select
            showSearch
            style={{ width: 300 }}
            placeholder="Select a user"
            loading={usersLoading}
            onChange={(value) => setUserId(value)}
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {users.map(user => (
              <Option key={user.id} value={user.id}>
                {user.name} ({user.email})
              </Option>
            ))}
          </Select>
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={fetchPrediction}
            loading={predictionLoading}
            disabled={!userId}
          >
            Get Prediction
          </Button>
        </div>
        {predictionError && (
          <Text type="danger" className="mt-2 block">{predictionError}</Text>
        )}
        {prediction && (
          <div className="mt-4">
            <Title level={4}>Prediction Results:</Title>
            <Text>Predicted Next Purchase Date: {new Date(prediction.predicted_next_purchase_date).toLocaleDateString()}</Text><br/>
            <Text>Predicted Category: {prediction.predicted_category}</Text><br/>
            <Text>Confidence Score: {(prediction.confidence_score * 100).toFixed(2)}%</Text>
          </div>
        )}

        {/* Purchase History Graph */}
        {purchaseHistoryData.length > 0 && (
          <div className="mt-8" style={{ width: '100%', height: 300 }}>
            <Title level={4}>Purchase History:</Title>
            <ResponsiveContainer>
              <LineChart
                data={purchaseHistoryData}
                margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <RechartsLine type="monotone" dataKey="total" stroke="#8884d8" name="Total Price" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

      </Card>

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