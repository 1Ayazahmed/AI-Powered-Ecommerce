import React from 'react';
import { Card, Row, Col, Statistic, Table, Button, Space, Typography } from 'antd';
import { 
  ShoppingOutlined, 
  UserOutlined, 
  DollarOutlined, 
  ShoppingCartOutlined,
  RobotOutlined,
  LineChartOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const { Title } = Typography;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { orders } = useSelector((state) => state.orders);
  const { products } = useSelector((state) => state.products);

  const totalSales = orders.reduce((sum, order) => sum + order.totalPrice, 0);
  const totalOrders = orders.length;
  const totalProducts = products.length;
  const uniqueCustomers = new Set(orders.map(order => order.user)).size;

  const recentOrders = orders.slice(0, 5).map(order => ({
    key: order._id,
    orderId: order._id,
    customer: order.user.name,
    total: order.totalPrice,
    status: order.isPaid ? 'Paid' : 'Pending',
    date: new Date(order.createdAt).toLocaleDateString(),
  }));

  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'orderId',
      key: 'orderId',
    },
    {
      title: 'Customer',
      dataIndex: 'customer',
      key: 'customer',
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (total) => `$${total.toFixed(2)}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <span style={{ color: status === 'Paid' ? '#52c41a' : '#faad14' }}>
          {status}
        </span>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>Admin Dashboard</Title>
        <Space>
          <Button 
            type="primary" 
            icon={<RobotOutlined />}
            onClick={() => navigate('/ai-features')}
            className="flex items-center"
          >
            AI Features
          </Button>
          <Button 
            type="primary" 
            icon={<LineChartOutlined />}
            onClick={() => navigate('/admin/ai-features')}
            className="flex items-center"
          >
            Analytics
          </Button>
        </Space>
      </div>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title={<div className="flex items-center"><DollarOutlined className="mr-2" /> Total Sales</div>}
              value={totalSales}
              precision={2}
              prefix="$"
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title={<div className="flex items-center"><ShoppingCartOutlined className="mr-2" /> Total Orders</div>}
              value={totalOrders}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title={<div className="flex items-center"><ShoppingOutlined className="mr-2" /> Total Products</div>}
              value={totalProducts}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title={<div className="flex items-center"><UserOutlined className="mr-2" /> Total Customers</div>}
              value={uniqueCustomers}
              valueStyle={{ color: '#eb2f96' }}
            />
          </Card>
        </Col>
      </Row>

      <Card 
        title="Recent Orders" 
        className="shadow-sm"
        extra={
          <Button type="link" onClick={() => navigate('/orders')}>
            View All Orders
          </Button>
        }
      >
        <Table
          dataSource={recentOrders}
          columns={columns}
          pagination={false}
          className="recent-orders-table"
        />
      </Card>
    </div>
  );
};

export default AdminDashboard; 