import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import {
  getDashboardOverview,
  getRevenueAnalytics,
  getOrderStatistics,
  getTopProducts,
  getRecentOrders,
  getSalesByCategory,
  getPopularFavorites,
} from "../../services/api";
import { getImageUrl } from "../../utils/imageUtils";

const AdvancedSectionFilter = ({ filters, setFilters, years, months, hideCustom = false }) => {
  const [viewMode, setViewMode] = useState(
    !hideCustom && (filters.startDate || filters.endDate) ? "custom" : "standard",
  );

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-slate-50 border border-slate-200 p-1 rounded-xl shadow-sm w-full sm:w-auto">
      {/* Toggle Controls */}
      {!hideCustom && (
        <div className="flex bg-white rounded-lg p-0.5 border border-slate-100 shadow-sm flex-1 sm:flex-initial">
          <button
            onClick={() => {
              setViewMode("standard");
              setFilters({ ...filters, startDate: "", endDate: "" });
            }}
            className={`flex-1 sm:px-3 py-1.5 rounded-md text-[9px] font-bold uppercase tracking-tight transition-all ${
              viewMode === "standard"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            Standard
          </button>
          <button
            onClick={() => setViewMode("custom")}
            className={`flex-1 sm:px-3 py-1.5 rounded-md text-[9px] font-bold uppercase tracking-tight transition-all ${
              viewMode === "custom"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            Custom Range
          </button>
        </div>
      )}

      <div className="flex items-center gap-1.5 flex-1 sm:flex-initial">
        {viewMode === "standard" || hideCustom ? (
          <div className="flex items-center gap-1.5 w-full animate-in fade-in slide-in-from-left-2 duration-300">
            <select
              value={filters.year}
              onChange={(e) => setFilters({ ...filters, year: parseInt(e.target.value) })}
              className="flex-1 sm:flex-initial bg-white border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-bold text-slate-700 outline-none hover:border-blue-300 shadow-sm min-w-[70px]"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>

            <select
              value={filters.month}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  month: e.target.value === "" ? "" : parseInt(e.target.value),
                })
              }
              className="flex-1 sm:flex-initial bg-white border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-bold text-slate-700 outline-none hover:border-blue-300 shadow-sm"
            >
              {months.map((m) => (
                <option key={m.label} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="flex items-center bg-white border border-slate-200 rounded-lg px-2 py-1 gap-1 shadow-sm w-full animate-in fade-in slide-in-from-right-2 duration-300 overflow-hidden">
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="bg-transparent text-[10px] font-bold outline-none w-full sm:w-24 text-slate-700 cursor-pointer"
            />
            <span className="text-slate-300 font-bold shrink-0">→</span>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="bg-transparent text-[10px] font-bold outline-none w-full sm:w-24 text-slate-700 cursor-pointer"
              min={filters.startDate}
            />
          </div>
        )}
      </div>
    </div>
  );
};

const AdminOverview = () => {
  const [overviewFilters, setOverviewFilters] = useState({
    year: new Date().getFullYear(),
    month: "",
    startDate: "",
    endDate: "",
  });
  const [revenueFilters, setRevenueFilters] = useState({
    year: new Date().getFullYear(),
    month: "",
    startDate: "",
    endDate: "",
  });
  const [statusFilters, setStatusFilters] = useState({
    year: new Date().getFullYear(),
    month: "",
    startDate: "",
    endDate: "",
  });
  const [volumeFilters, setVolumeFilters] = useState({
    year: new Date().getFullYear(),
    month: "",
    startDate: "",
    endDate: "",
  });
  const [categoryFilters, setCategoryFilters] = useState({
    year: new Date().getFullYear(),
    month: "",
    startDate: "",
    endDate: "",
  });

  const [orderStatusData, setOrderStatusData] = useState([]);
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    products: 0,
    categories: 0,
    customers: 0,
    revenueChange: 0,
    ordersChange: 0,
    topCategory: { name: "N/A", sales: 0 },
    deliveredOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [salesByCategory, setSalesByCategory] = useState([]);
  const [popularFavorites, setPopularFavorites] = useState([]);
  const [revenueMonthly, setRevenueMonthly] = useState([]);
  const [volumeMonthly, setVolumeMonthly] = useState([]);
  const [loading, setLoading] = useState(true);

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  const months = [
    { value: "", label: "All Months" },
    { value: 1, label: "Jan" },
    { value: 2, label: "Feb" },
    { value: 3, label: "Mar" },
    { value: 4, label: "Apr" },
    { value: 5, label: "May" },
    { value: 6, label: "Jun" },
    { value: 7, label: "Jul" },
    { value: 8, label: "Aug" },
    { value: 9, label: "Sep" },
    { value: 10, label: "Oct" },
    { value: 11, label: "Nov" },
    { value: 12, label: "Dec" },
  ];

  const getParams = (filters) => {
    const isCustomMode = !!(filters.startDate || filters.endDate);
    return {
      year: isCustomMode ? undefined : filters.year,
      month: isCustomMode ? undefined : filters.month || undefined,
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined,
    };
  };

  // 1. Fetch Revenue Data
  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        const params = getParams(revenueFilters);
        const revenueRes = await getRevenueAnalytics(params);
        setRevenueMonthly(revenueRes.data?.monthlyData || []);
      } catch (error) {
        console.error("Revenue Fetch Error:", error);
      }
    };
    fetchRevenueData();
  }, [revenueFilters]);

  // 1.1 Fetch Sales by Category Data
  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        const params = getParams(categoryFilters);
        const categoryRes = await getSalesByCategory(params);
        setSalesByCategory(categoryRes.data || []);
      } catch (error) {
        console.error("Category Fetch Error:", error);
      }
    };
    fetchCategoryData();
  }, [categoryFilters]);

  // 1.1 Fetch Overview Stats (Header controlled)
  useEffect(() => {
    const fetchOverviewData = async () => {
      try {
        const params = getParams(overviewFilters);
        const [revenueRes, categoryRes, statusRes] = await Promise.all([
          getRevenueAnalytics(params),
          getSalesByCategory(params),
          getOrderStatistics(params),
        ]);

        const revenueData = revenueRes.data;
        const categoryData = categoryRes.data || [];
        const statusData = statusRes.data || {};

        // Find top category
        const sortedCats = [...categoryData].sort((a, b) => b.sales - a.sales);
        const topCat = sortedCats[0] || { category: "N/A", sales: 0 };

        setStats((prev) => ({
          ...prev,
          revenue: revenueData?.totalRevenue || 0,
          revenueChange: revenueData?.revenueGrowth || revenueData?.growth || 0,
          orders: revenueData?.totalOrders || 0,
          ordersChange: revenueData?.orderGrowth || 0,
          topCategory: {
            name: topCat.category || topCat.name || "N/A",
            sales: topCat.sales || 0,
          },
          deliveredOrders: statusData.Delivered || 0,
        }));
      } catch (error) {
        console.error("Overview Stats Error:", error);
      }
    };
    fetchOverviewData();
  }, [overviewFilters]);

  // 2. Fetch Order Volume Data
  useEffect(() => {
    const fetchVolumeData = async () => {
      try {
        const params = getParams(volumeFilters);
        const revenueRes = await getRevenueAnalytics(params);
        setVolumeMonthly(revenueRes.data?.monthlyData || []);
      } catch (error) {
        console.error("Volume Fetch Error:", error);
      }
    };
    fetchVolumeData();
  }, [volumeFilters]);

  // 3. Fetch Order Status Data
  useEffect(() => {
    const fetchStatusData = async () => {
      try {
        const params = getParams(statusFilters);
        const ordersStatsRes = await getOrderStatistics(params);
        const ordersData = ordersStatsRes.data;

        if (ordersData) {
          setOrderStatusData(
            [
              { name: "Pending", value: ordersData.pending || 0, color: "#f59e0b" },
              { name: "Confirmed", value: ordersData.confirmed || 0, color: "#3b82f6" },
              { name: "Shipped", value: ordersData.shipped || 0, color: "#8b5cf6" },
              { name: "Delivered", value: ordersData.delivered || 0, color: "#10b981" },
              { name: "Cancelled", value: ordersData.cancelled || 0, color: "#ef4444" },
            ].filter((item) => item.value > 0),
          );
        }
      } catch (error) {
        console.error("Status Fetch Error:", error);
      }
    };
    fetchStatusData();
  }, [statusFilters]);

  // 4. Fetch Favorites Data (No Filters)
  useEffect(() => {
    const fetchFavoritesData = async () => {
      try {
        const favoritesRes = await getPopularFavorites({});
        setPopularFavorites(favoritesRes.data || []);
      } catch (error) {
        console.error("Favorites Fetch Error:", error);
      }
    };
    fetchFavoritesData();
  }, []);

  // 4. Initial Load for Static/Global Overview (Recent Orders, Top Products, Inventory)
  useEffect(() => {
    const fetchStaticData = async () => {
      try {
        const [overviewRes, topProductsRes, recentOrdersRes] = await Promise.all([
          getDashboardOverview({ year: new Date().getFullYear() }),
          getTopProducts({ limit: 5 }),
          getRecentOrders({ limit: 5 }),
        ]);

        const overview = overviewRes.data;
        const topProdsData = topProductsRes.data || [];
        const recentOrdersData = recentOrdersRes.data || [];
        setStats((prev) => ({
          ...prev,
          products: overview?.totalProducts || 0,
          categories: overview?.totalCategories || 0,
          customers: overview?.totalCustomers || 0,
        }));

        setRecentOrders(recentOrdersData.slice(0, 5));
        setTopProducts(topProdsData.slice(0, 5));
      } catch (error) {
        console.error("Static Data Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStaticData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

  if (loading) return <div className="p-10 text-center text-slate-500">Loading Dashboard...</div>;

  return (
    <div className="p-6 space-y-8 bg-slate-50/50 min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Dashboard Overview</h1>
          <p className="text-slate-500 mt-1 font-medium">
            Real-time performance metrics & analytics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <AdvancedSectionFilter
            filters={overviewFilters}
            setFilters={setOverviewFilters}
            years={years}
            months={months}
          />
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.revenue)}
          change={stats.revenueChange}
          icon={
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          }
          color="bg-gradient-to-br from-green-500 to-emerald-600"
        />
        <StatCard
          title="Orders"
          value={stats.orders}
          change={stats.ordersChange}
          icon={
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          }
          color="bg-gradient-to-br from-blue-500 to-indigo-600"
        />
        <StatCard
          title="Top Category"
          value={stats.topCategory.name}
          subValue={formatCurrency(stats.topCategory.sales)}
          icon={
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            />
          }
          color="bg-gradient-to-br from-amber-500 to-orange-600"
        />
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* REVENUE CHART */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6">
            <h2 className="text-xl font-bold text-slate-800">Revenue Overview</h2>
            <AdvancedSectionFilter
              filters={revenueFilters}
              setFilters={setRevenueFilters}
              years={years}
              months={months}
              hideCustom={true}
            />
          </div>
          <div className="relative h-[350px] w-full min-h-[350px]">
            <ResponsiveContainer width="99%" height="99%">
              <AreaChart data={revenueMonthly}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  tickFormatter={(value) => `₹${value / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  }}
                  formatter={(value) => [formatCurrency(value), "Revenue"]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SALES BY CATEGORY CHART */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex flex-col gap-4 mb-6">
            <h2 className="text-xl font-bold text-slate-800">Sales by Category</h2>
            <AdvancedSectionFilter
              filters={categoryFilters}
              setFilters={setCategoryFilters}
              years={years}
              months={months}
            />
          </div>
          <div className="relative h-[400px] w-full min-h-[400px]">
            <ResponsiveContainer width="99%" height="99%">
              <PieChart>
                <Pie
                  data={salesByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="sales"
                  nameKey="category"
                >
                  {salesByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  }}
                  formatter={(value, name) => [formatCurrency(value), name]}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ORDER VOLUME CHART */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
          <div className="flex flex-col gap-4 mb-6">
            <h2 className="text-xl font-bold text-slate-800">Order Volume Trends</h2>
            <AdvancedSectionFilter
              filters={volumeFilters}
              setFilters={setVolumeFilters}
              years={years}
              months={months}
            />
          </div>
          <div className="relative h-[300px] w-full min-h-[300px]">
            <ResponsiveContainer width="99%" height="99%">
              <BarChart data={volumeMonthly}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{
                    backgroundColor: "#fff",
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Bar dataKey="orders" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ORDER STATUS BREAKDOWN */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col transition-all hover:shadow-md">
          <div className="flex flex-col gap-4 mb-6">
            <h2 className="text-xl font-bold text-slate-800">Order Status Distribution</h2>
            <AdvancedSectionFilter
              filters={statusFilters}
              setFilters={setStatusFilters}
              years={years}
              months={months}
            />
          </div>
          <div className="relative h-[350px] w-full min-h-[350px]">
            <ResponsiveContainer width="99%" height="99%">
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  nameKey="name"
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell key={`status-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* POPULAR FAVORITES */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-800">Popular Favorites</h2>
            <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full border border-amber-200 ring-4 ring-amber-50">
              User Interests
            </span>
          </div>
          <div className="divide-y divide-slate-100 overflow-y-auto max-h-[300px]">
            {popularFavorites.length > 0 ? (
              popularFavorites.map((item, index) => (
                <div
                  key={item.productId || `fav-${index}`}
                  className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 font-bold text-xs ring-4 ring-rose-50/50">
                    #{index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-slate-800 truncate">
                      {item.productName}
                    </h4>
                    <p className="text-xs text-slate-500">{item.favoritesCount} people favorited</p>
                  </div>
                  <Link
                    to={`/admin/products?search=${item.productName}`}
                    className="text-xs font-bold text-blue-600 hover:underline"
                  >
                    View
                  </Link>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-slate-500 text-sm">No favorites data.</div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* RECENT ORDERS */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-800">Recent Customer Activity</h2>
            <Link
              to="/dashboard/orders"
              className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all"
            >
              View History
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/80 text-[10px] uppercase text-slate-500 font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Transaction</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Value</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.length > 0 ? (
                  recentOrders.map((order, index) => (
                    <tr
                      key={order.id || order._id || `order-${index}`}
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-slate-800">
                          #{String(order.id || order._id).slice(-6)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-slate-600">
                          {order.customerName || "Guest"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-black text-slate-900">
                          {formatCurrency(order.amount || order.total_amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={order.status || order.orderStatus} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-slate-500 text-sm">
                      No recent activity.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* TOP PRODUCTS LIST */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-800">Performance Leaders</h2>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              By Revenue
            </span>
          </div>
          <div className="divide-y divide-slate-100">
            {topProducts.length > 0 ? (
              topProducts.map((product, index) => (
                <div
                  key={product.id || product._id || `top-${index}`}
                  className="p-5 flex items-center gap-4 hover:bg-slate-50 transition-colors group"
                >
                  <div className="relative w-14 h-14 bg-slate-100 rounded-xl overflow-hidden shadow-inner group-hover:scale-105 transition-transform">
                    <img
                      src={getImageUrl(product)}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "https://placehold.jp/400x400.png?text=No%20Image";
                      }}
                    />
                    {index === 0 && (
                      <div className="absolute top-0 right-0 p-1 bg-amber-400 rounded-bl-lg">
                        <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-800 transition-colors group-hover:text-blue-600 truncate">
                      {product.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        {product.sales || product.totalSold || 0} Sold
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-slate-900">
                      {formatCurrency(product.revenue || product.totalRevenue || 0)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-16 text-center text-slate-500 text-sm">No sales leaders yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, subValue, icon, color, change }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4 hover:shadow-md transition-all group">
    <div
      className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="w-7 h-7"
      >
        {icon}
      </svg>
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider truncate">
        {title}
      </p>
      <div className="flex items-baseline gap-2 flex-wrap">
        <h3 className="text-2xl font-bold text-slate-800 truncate">{value}</h3>
        {subValue && <span className="text-[10px] font-bold text-slate-500">{subValue}</span>}
        {change !== undefined && (
          <span
            className={`text-xs font-bold ${change >= 0 ? "text-emerald-500" : "text-rose-500"}`}
          >
            {change >= 0 ? "+" : ""}
            {change}%
          </span>
        )}
      </div>
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const s = String(status || "").toUpperCase();
  const styles = {
    PENDING: "bg-amber-100 text-amber-700 border-amber-200",
    CONFIRMED: "bg-blue-100 text-blue-700 border-blue-200",
    PROCESSING: "bg-indigo-100 text-indigo-700 border-indigo-200",
    SHIPPED: "bg-purple-100 text-purple-700 border-purple-200",
    DELIVERED: "bg-green-100 text-green-700 border-green-200",
    CANCELLED: "bg-red-100 text-red-700 border-red-200",
    FAILED: "bg-rose-100 text-rose-700 border-rose-200",
  };
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-bold border ${styles[s] || "bg-slate-100 text-slate-600 border-slate-200"}`}
    >
      {s}
    </span>
  );
};

export default AdminOverview;
