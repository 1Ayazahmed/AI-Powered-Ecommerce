import Chart from "react-apexcharts";
import { useGetUsersQuery } from "../../redux/api/usersApiSlice";
import {
  useGetTotalOrdersQuery,
  useGetTotalSalesByDateQuery,
  useGetTotalSalesQuery,
} from "../../redux/api/orderApiSlice";

import { useState, useEffect } from "react";
import AdminMenu from "./AdminMenu";
import OrderList from "./OrderList";
import Loader from "../../components/Loader";
import { Card, Select, Button, Typography } from 'antd';
import Message from "../../components/Message";
import { SearchOutlined } from '@ant-design/icons';
import axios from 'axios';
import { LineChart, Line as RechartsLine, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useFetchCategoriesQuery } from "../../redux/api/categoryApiSlice";

const { Option } = Select;
const { Title, Text } = Typography;

const AdminDashboard = () => {
  const { data: sales, isLoading } = useGetTotalSalesQuery();
  const { data: customers, isLoading: loading } = useGetUsersQuery();
  const { data: orders, isLoading: loadingTwo } = useGetTotalOrdersQuery();
  const { data: salesDetail } = useGetTotalSalesByDateQuery();

  // User Prediction states
  const [userId, setUserId] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [predictionError, setPredictionError] = useState(null);
  const [purchaseHistoryData, setPurchaseHistoryData] = useState([]);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // Fetch categories for displaying category name
  const { data: categoriesData } = useFetchCategoriesQuery();
  const [categories, setCategories] = useState([]);

  const [state, setState] = useState({
    options: {
      chart: {
        type: "line",
      },
      tooltip: {
        theme: "dark",
      },
      colors: ["#00E396"],
      dataLabels: {
        enabled: true,
      },
      stroke: {
        curve: "smooth",
      },
      title: {
        text: "Sales Trend",
        align: "left",
      },
      grid: {
        borderColor: "#ccc",
      },
      markers: {
        size: 1,
      },
      xaxis: {
        categories: [],
        title: {
          text: "Date",
        },
      },
      yaxis: {
        title: {
          text: "Sales",
        },
        min: 0,
      },
      legend: {
        position: "top",
        horizontalAlign: "right",
        floating: true,
        offsetY: -25,
        offsetX: -5,
      },
    },
    series: [{ name: "Sales", data: [] }],
  });

  useEffect(() => {
    if (salesDetail) {
      const formattedSalesDate = salesDetail.map((item) => ({
        x: item._id,
        y: item.totalSales,
      }));

      setState((prevState) => ({
        ...prevState,
        options: {
          ...prevState.options,
          xaxis: {
            categories: formattedSalesDate.map((item) => item.x),
          },
        },

        series: [
          { name: "Sales", data: formattedSalesDate.map((item) => item.y) },
        ],
      }));
    }
  }, [salesDetail]);

  // Update categories state when categoriesData is available
  useEffect(() => {
    if (categoriesData) {
      setCategories(categoriesData);
    }
  }, [categoriesData]);

  // Fetch users for prediction
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const response = await axios.get('http://localhost:5004/api/users');
      console.log('Fetched users:', response.data); // Debug log
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setUsersLoading(false);
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
      const response = await axios.post('http://localhost:5004/predict', { userId });
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

  return (
    <>
      <AdminMenu />

      <section className="p-4 md:p-6 xl:ml-[4rem] md:ml-[0rem]">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
          <div className="rounded-lg bg-black p-5 w-full mt-5">
            <div className="font-bold rounded-full w-[3rem] bg-pink-500 text-center p-3">
              $
            </div>

            <p className="mt-5">Sales</p>
            <h1 className="text-xl font-bold">
              $ {isLoading ? <Loader /> : sales.totalSales.toFixed(2)}
            </h1>
          </div>
          <div className="rounded-lg bg-black p-5 w-full mt-5">
            <div className="font-bold rounded-full w-[3rem] bg-pink-500 text-center p-3">
              $
            </div>

            <p className="mt-5">Customers</p>
            <h1 className="text-xl font-bold">
              $ {isLoading ? <Loader /> : customers?.length}
            </h1>
          </div>
          <div className="rounded-lg bg-black p-5 w-full mt-5">
            <div className="font-bold rounded-full w-[3rem] bg-pink-500 text-center p-3">
              $
            </div>

            <p className="mt-5">All Orders</p>
            <h1 className="text-xl font-bold">
              $ {isLoading ? <Loader /> : orders?.totalOrders}
            </h1>
          </div>
        </div>

        {/* Sales Chart */}
        <div className="w-full mx-auto mt-8">
          <Chart
            options={state.options}
            series={state.series}
            type="line"
            height={350}
          />
        </div>

        {/* User Prediction Section */}
        <div className="w-full mx-auto mt-8">
          <Card
            title={
              <div className="text-white text-lg md:text-xl font-semibold">
                User Purchase Prediction
              </div>
            }
            className="mb-6 bg-black border-gray-800"
            headStyle={{ borderBottom: '1px solid #333' }}
            bodyStyle={{ backgroundColor: 'black' }}
          >
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-4 mb-4">
              <Select
                showSearch
                style={{
                  width: '100%', // Make select full width on small screens
                  maxWidth: 300, // Max width on larger screens
                  color: '#ccc',
                }}
                placeholder="Select a user"
                loading={usersLoading}
                onChange={(value) => setUserId(value)}
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                className="custom-select"
                dropdownStyle={{ backgroundColor: '#1a1a1a', color: 'white' }}
                popupClassName="custom-dropdown"
              >
                {users && users.length > 0 ? (
                  users.map(user => (
                    <Option key={user.id} value={user.id} style={{ color: 'white' }}>
                      {user.name} ({user.email})
                    </Option>
                  ))
                ) : (
                  <Option disabled style={{ color: '#666' }}>No users available</Option>
                )}
              </Select>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={fetchPrediction}
                loading={predictionLoading}
                className="w-full md:w-auto" /* Make button full width on small scre */
              >
                Get Prediction
              </Button>
            </div>

            {predictionLoading && <Loader />}
            {predictionError && <Message variant="danger">{predictionError}</Message>}

            {prediction && (
              <div className="mt-4">
                <Title level={4} className="text-white">Prediction Result:</Title>
                <Text className="text-white">Date: {new Date(prediction.predicted_date).toLocaleDateString()}</Text><br />
                <Text className="text-white">Category: {categories.find(cat => cat._id === prediction.predicted_category)?.name || prediction.predicted_category}</Text><br />
                <Text className="text-white">Confidence: {prediction.confidence_score.toFixed(2)}</Text>

                {/* Purchase History Chart */}
                {purchaseHistoryData && purchaseHistoryData.length > 0 && (
                  <div className="mt-6">
                    <Title level={4} className="text-white">Purchase History:</Title>
                     <ResponsiveContainer width="100%" height={300}>
                      <LineChart
                        data={purchaseHistoryData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey="date" stroke="#ccc" />
                        <YAxis stroke="#ccc" />
                        <Tooltip contentStyle={{ backgroundColor: '#333', border: '1px solid #555' }} itemStyle={{ color: 'white' }} />
                        <Legend />
                        <RechartsLine type="monotone" dataKey="total" stroke="#8884d8" activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            )}

          </Card>
        </div>

        {/* Order List */}
        <div className="mt-8">
          <OrderList />
        </div>
      </section>

      {/* Add custom styles for Select component */}
      <style jsx global>{`
        .custom-select .ant-select-selector {
          background-color: #1a1a1a !important;
          border-color: #333 !important;
          color: white !important;
        }
        .custom-select .ant-select-selection-placeholder {
          color: #ccc !important;
        }
        .custom-select .ant-select-selection-item {
          color: white !important;
        }
        .custom-select .ant-select-arrow {
          color: #666 !important;
        }
        .custom-dropdown .ant-select-item {
          color: white !important;
        }
        .custom-dropdown .ant-select-item-option-selected {
          background-color: #333 !important;
        }
        .custom-dropdown .ant-select-item-option-active {
          background-color: #1a1a1a !important;
        }
      `}</style>
    </>
  );
};

export default AdminDashboard;
