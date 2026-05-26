import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { Users, UserCheck, UserX, Shield, ShieldCheck, ShieldOff, Package, AlertTriangle, Loader2, TrendingUp, Calendar } from "lucide-react";
import adminApi from "../../../services/adminApi";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#d0ed57'];

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    userAdmin: {},
    collected: { total: {}, byCategory: [], byMonth: [], topWasteTypes: [] },
    reported: { total: {}, byCategory: [], byMonth: [], byColor: [], byLocation: [], topWasteTypes: [] }
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await adminApi.get("/analytics/overview");
      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100">
        <Loader2 className="animate-spin h-12 w-12 text-green-600" />
      </div>
    );
  }

  const { userAdmin, collected, reported } = data;
  const totalUsers = userAdmin.total_users || 0;
  const totalAdmins = userAdmin.total_admins || 0;
  const onlineUsers = userAdmin.online_users || 0;
  const onlineAdmins = userAdmin.online_admins || 0;
  const offlineUsers = totalUsers - onlineUsers;
  const offlineAdmins = totalAdmins - onlineAdmins;

  const monthlyCollectedData = collected.byMonth || [];
  const monthlyReportedData = reported.byMonth || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-6 mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-green-700 mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">complete overview of all features through graph-based data visualization</p>
        </motion.div>

        {/* User & Admin Stats Cards (6 cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
            className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-md p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-full"><Users className="h-8 w-8 text-blue-600" /></div>
            <div><p className="text-gray-500 text-sm">Total Users</p><p className="text-3xl font-bold text-gray-800">{totalUsers}</p></div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
            className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-md p-6 flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-full"><UserCheck className="h-8 w-8 text-green-600" /></div>
            <div><p className="text-gray-500 text-sm">Online Users</p><p className="text-3xl font-bold text-green-600">{onlineUsers}</p></div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-md p-6 flex items-center gap-4">
            <div className="p-3 bg-gray-100 rounded-full"><UserX className="h-8 w-8 text-gray-600" /></div>
            <div><p className="text-gray-500 text-sm">Offline Users</p><p className="text-3xl font-bold text-gray-800">{offlineUsers}</p></div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}
            className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-md p-6 flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-full"><Shield className="h-8 w-8 text-purple-600" /></div>
            <div><p className="text-gray-500 text-sm">Total Admins</p><p className="text-3xl font-bold text-gray-800">{totalAdmins}</p></div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
            className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-md p-6 flex items-center gap-4">
            <div className="p-3 bg-indigo-100 rounded-full"><ShieldCheck className="h-8 w-8 text-indigo-600" /></div>
            <div><p className="text-gray-500 text-sm">Online Admins</p><p className="text-3xl font-bold text-indigo-600">{onlineAdmins}</p></div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}
            className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-md p-6 flex items-center gap-4">
            <div className="p-3 bg-gray-100 rounded-full"><ShieldOff className="h-8 w-8 text-gray-600" /></div>
            <div><p className="text-gray-500 text-sm">Offline Admins</p><p className="text-3xl font-bold text-gray-800">{offlineAdmins}</p></div>
          </motion.div>
        </div>

        {/* COLLECTED WASTE SECTION */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-6"><Package className="h-7 w-7 text-green-600" /><h2 className="text-2xl font-bold text-gray-800">Collected Waste Analytics</h2></div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl p-4 shadow flex items-center justify-between">
              <span className="text-gray-600">Total Records</span><span className="text-2xl font-bold text-blue-600">{collected.total?.records || 0}</span>
            </div>
            <div className="bg-white rounded-xl p-4 shadow flex items-center justify-between">
              <span className="text-gray-600">Total Quantity (units)</span><span className="text-2xl font-bold text-green-600">{collected.total?.quantity?.toFixed(1) || 0}</span>
            </div>
          </div>

          {/* Top Waste Types (list) */}
          <div className="bg-white rounded-xl p-4 shadow mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">🏆 Top Collected Waste Types</h3>
            {collected.topWasteTypes?.length ? (
              <div className="space-y-3">
                {collected.topWasteTypes.slice(0, 5).map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center border-b border-gray-100 pb-2">
                    <span className="text-gray-700">{item.wastename}</span>
                    <span className="font-semibold text-green-600">{item.count} records ({item.total_quantity?.toFixed(1)} units)</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-gray-400">No data</p>}
          </div>

          {/* Collected by Category - BAR CHART (replaces pie) */}
          <div className="bg-white rounded-xl p-4 shadow mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <BarChart className="w-5 h-5 text-green-600" /> Collected by Category
            </h3>
            {!collected.byCategory?.length ? (
              <p className="text-gray-500 text-center py-8">No collected waste data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={collected.byCategory} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" name="Number of records" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Monthly Collection Trend */}
          <div className="bg-white rounded-xl p-4 shadow">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" /> Monthly Collection Trend (Last 12 months)
            </h3>
            {!monthlyCollectedData.length ? (
              <p className="text-gray-500 text-center py-8">No monthly data available.</p>
            ) : (
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={monthlyCollectedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="count" stroke="#8884d8" name="Number of records" />
                  <Line yAxisId="right" type="monotone" dataKey="total_quantity" stroke="#82ca9d" name="Total quantity" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {/* REPORTED WASTE SECTION */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-6"><AlertTriangle className="h-7 w-7 text-orange-600" /><h2 className="text-2xl font-bold text-gray-800">Reported Waste Analytics</h2></div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl p-4 shadow flex items-center justify-between">
              <span className="text-gray-600">Total Reports</span><span className="text-2xl font-bold text-orange-600">{reported.total?.records || 0}</span>
            </div>
            <div className="bg-white rounded-xl p-4 shadow flex items-center justify-between">
              <span className="text-gray-600">Most Reported Waste</span><span className="font-semibold text-gray-700">{reported.topWasteTypes?.[0]?.wastename || "—"}</span>
            </div>
          </div>

          {/* Top Reported Waste Types */}
          <div className="bg-white rounded-xl p-4 shadow mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">⚠️ Most Reported Waste Types</h3>
            {reported.topWasteTypes?.length ? (
              <div className="space-y-3">
                {reported.topWasteTypes.slice(0, 5).map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center border-b border-gray-100 pb-2">
                    <span className="text-gray-700">{item.wastename}</span><span className="font-semibold text-orange-600">{item.count} reports</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-gray-400">No data</p>}
          </div>

          {/* Reported by Category - BAR CHART */}
          <div className="bg-white rounded-xl p-4 shadow mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <BarChart className="w-5 h-5 text-orange-600" /> Reports by Category
            </h3>
            {!reported.byCategory?.length ? (
              <p className="text-gray-500 text-center py-8">No report data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={reported.byCategory} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#FF8042" name="Number of reports" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Reported by Color - BAR CHART (replaces pie) */}
          <div className="bg-white rounded-xl p-4 shadow mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <BarChart className="w-5 h-5 text-orange-600" /> Reports by Color
            </h3>
            {!reported.byColor?.length ? (
              <p className="text-gray-500 text-center py-8">No color data available.</p>
            ) : (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={reported.byColor} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="color" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#00C49F" name="Reports" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Monthly Report Trend */}
          <div className="bg-white rounded-xl p-4 shadow mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-600" /> Monthly Report Trend (Last 12 months)
            </h3>
            {!monthlyReportedData.length ? (
              <p className="text-gray-500 text-center py-8">No monthly data available.</p>
            ) : (
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={monthlyReportedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="count" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} name="Reports" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Top Locations - Horizontal Bar Chart */}
          <div className="bg-white rounded-xl p-4 shadow">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-600" /> Top Locations by Reports
            </h3>
            {!reported.byLocation?.length ? (
              <p className="text-gray-500 text-center py-8">No location data available.</p>
            ) : (
              <ResponsiveContainer width="100%" height={Math.min(400, reported.byLocation.length * 45)}>
                <BarChart data={reported.byLocation} layout="vertical" margin={{ top: 20, right: 30, left: 100, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="location" width={120} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#00C49F" name="Reports" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}