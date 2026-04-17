import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { Loader2, Package, FileText, TrendingUp, Calendar, PieChart as PieIcon } from 'lucide-react';
import api from '../../../services/api';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec489a'];

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/dashboard');
        console.log('Dashboard full response:', response.data);
        if (response.data.success) {
          setDashboardData(response.data.data);
        } else {
          setError(response.data.message);
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError(err.response?.data?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100">
        <Loader2 className="w-12 h-12 text-green-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center">
          <p className="text-red-500 text-lg">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { user, totals, monthlySummary, collectedByCategory, reportedByCategory, recentCollections, recentReports } = dashboardData;

  // I-convert ang count sa integer (para sa pie chart)
  const pieData = (reportedByCategory || []).map(item => ({
    ...item,
    count: Number(item.count)
  })).slice(0, 5);

  console.log('Converted pieData:', pieData);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyChartData = monthlySummary.map(item => ({
    month: `${monthNames[item.month - 1]} ${item.year}`,
    collected: item.collected_count,
    reported: item.reported_count,
  }));

  const barData = collectedByCategory?.slice(0, 5) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-6 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4"
        >
          <div className="flex items-center gap-4">
            {user.avatar ? (
              <img src={user.avatar} alt="Avatar" className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-green-200 flex items-center justify-center text-green-700 font-bold text-2xl">
                {user.email.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Welcome back!</h1>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Member since {new Date().toLocaleDateString()}
          </div>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-md p-6 flex items-center gap-4"
          >
            <div className="p-3 bg-green-100 rounded-full">
              <Package className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Waste Collected</p>
              <p className="text-3xl font-bold text-gray-800">
                {totals.totalCollectedQuantity} kg
              </p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-md p-6 flex items-center gap-4"
          >
            <div className="p-3 bg-green-100 rounded-full">
              <FileText className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Reports Submitted</p>
              <p className="text-3xl font-bold text-gray-800">{totals.totalReports}</p>
            </div>
          </motion.div>
        </div>

        {/* Monthly Trend */}
        {monthlyChartData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-md p-6 mb-8"
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-600" />
              Monthly Activity Trend
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="collected" stroke="#10b981" name="Collections" />
                <Line type="monotone" dataKey="reported" stroke="#3b82f6" name="Reports" />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Charts Section - bagong layout: bar chart sa itaas, pie chart sa ibaba (full width) */}
        <div className="space-y-8 mb-8">
          {/* Bar Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-md p-6"
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Waste Collected by Category (kg)
            </h3>
            {barData.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No data yet. Start collecting waste!</p>
            ) : (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total_quantity" fill="#10b981" name="Quantity (kg)" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </motion.div>

          {/* Pie Chart - Full width para makita nang maayos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-md p-6"
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-green-600" />
              Reports by Category
            </h3>
            {pieData.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No reports yet. Submit a report to see data!</p>
            ) : (
              <div className="flex justify-center">
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={140}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="category"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </motion.div>
        </div>

        {/* Recent Activity - two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-md p-6"
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Collections</h3>
            {recentCollections.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No collections recorded.</p>
            ) : (
              <ul className="space-y-3">
                {recentCollections.map((item) => (
                  <li key={item.id} className="flex items-center gap-3 p-2 border-b border-gray-200">
                    <img
                      src={item.photoUrl}
                      alt={item.wasteName}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{item.wasteName}</p>
                      <p className="text-sm text-gray-500">
                        {item.quantity} {item.unit} • {new Date(item.dateCollected).toLocaleDateString()}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-md p-6"
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Reports</h3>
            {recentReports.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No reports submitted.</p>
            ) : (
              <ul className="space-y-3">
                {recentReports.map((item) => (
                  <li key={item.id} className="flex items-center gap-3 p-2 border-b border-gray-200">
                    <img
                      src={item.photoUrl}
                      alt={item.wasteName}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{item.wasteName}</p>
                      <p className="text-sm text-gray-500">
                        {item.location} • {new Date(item.dateReported).toLocaleDateString()}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;