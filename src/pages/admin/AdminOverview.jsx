import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getMyProducts, getCategories, getAdminOrders } from "../../services/api";
import { getImageUrl } from "../../utils/imageUtils";

const AdminOverview = () => {
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    products: 0,
    categories: 0,
    customers: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [productsRes, categoriesRes, ordersRes] = await Promise.all([
          getMyProducts({ limit: 1000 }), // Get all for counts/low stock
          getCategories(),
          getAdminOrders({ limit: 100 }) // Get recent orders
        ]);

        // 1. Process Products
        const productList = productsRes.data?.data || productsRes.data?.products || (Array.isArray(productsRes.data) ? productsRes.data : []) || [];
        const lowStock = productList.filter(p => (p.stockQty || 0) < 10).slice(0, 5);

        // 2. Process Categories
        const categoryList = categoriesRes.data?.data || categoriesRes.data?.categories || (Array.isArray(categoriesRes.data) ? categoriesRes.data : []) || [];

        // 3. Process Orders
        let orderList = [];
        const rawOrders = ordersRes.data;
        if (rawOrders?.data && Array.isArray(rawOrders.data)) orderList = rawOrders.data;
        else if (rawOrders?.orders && Array.isArray(rawOrders.orders)) orderList = rawOrders.orders;
        else if (Array.isArray(rawOrders)) orderList = rawOrders;

        // Calculate Revenue (Only Confirmed, Shipped, and Delivered orders)
        const successfulStatuses = ['CONFIRMED', 'SHIPPED', 'DELIVERED'];
        const totalRevenue = orderList
          .filter(order => successfulStatuses.includes(String(order.orderStatus || order.status || '').toUpperCase()))
          .reduce((acc, order) => acc + (Number(order.totalAmount) || 0), 0);

        // Calculate Unique Customers
        const uniqueCustomers = new Set();
        orderList.forEach(order => {
          const userId = order.user?.id || order.userId || `guest-${order.address?.email}`;
          uniqueCustomers.add(userId);
        });

        setStats({
          revenue: totalRevenue,
          orders: orderList.length, // Total fetched (might differ from DB total if paginated, but good for overview)
          products: productList.length,
          categories: categoryList.length,
          customers: uniqueCustomers.size
        });

        setRecentOrders(orderList.slice(0, 5));
        setLowStockProducts(lowStock);

      } catch (error) {
        console.error("Dashboard Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  if (loading) return <div className="p-10 text-center text-slate-500">Loading Dashboard...</div>;

  return (
    <div className="p-6 space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Dashboard Overview</h1>
        <p className="text-slate-500 mt-1">Real-time insights and store performance.</p>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.revenue)}
          icon={<path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />}
          color="bg-gradient-to-br from-green-500 to-emerald-600"
        />
        <StatCard
          title="Total Orders"
          value={stats.orders}
          icon={<path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />}
          color="bg-gradient-to-br from-blue-500 to-indigo-600"
        />
        <StatCard
          title="Total Customers"
          value={stats.customers}
          icon={<path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />}
          color="bg-gradient-to-br from-teal-500 to-cyan-600"
        />
        <StatCard
          title="Total Products"
          value={stats.products}
          icon={<path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />}
          color="bg-gradient-to-br from-purple-500 to-violet-600"
        />
        <StatCard
          title="Categories"
          value={stats.categories}
          icon={<path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />}
          color="bg-gradient-to-br from-amber-500 to-orange-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* RECENT ORDERS */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-800">Recent Orders</h2>
            <Link to="/admin/orders" className="text-sm font-semibold text-blue-600 hover:text-blue-700">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
                <tr>
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.length > 0 ? (
                  recentOrders.map(order => (
                    <tr key={order.id || order._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-slate-700">#{String(order.id || order._id).slice(-6)}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {order.user?.name || "Guest"}
                        <div className="text-[10px] text-slate-400">{order.user?.email}</div>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-800">{formatCurrency(order.totalAmount)}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={order.orderStatus || order.status} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-slate-500 text-sm">No recent orders found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* LOW STOCK ALERT */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-fit">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              Low Stock Alert
            </h2>
          </div>
          <div className="p-0">
            {lowStockProducts.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {lowStockProducts.map(product => (
                  <div key={product.id || product._id} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                    <div className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200">
                      <img
                        src={getImageUrl(product)}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = "https://placehold.jp/400x400.png?text=No%20Image"; }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-slate-800 truncate">{product.name}</h4>
                      <p className="text-xs text-slate-500">Stock: <span className="font-bold text-red-600">{product.stockQty} left</span></p>
                    </div>
                    <Link to={`/admin/products?search=${product.name}`} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                      </svg>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="text-green-500 text-4xl mb-2">✓</div>
                <p className="text-slate-600 font-medium">All items well stocked!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4 hover:shadow-md transition-all group">
    <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
        {icon}
      </svg>
    </div>
    <div>
      <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const s = String(status || '').toUpperCase();
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
    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${styles[s] || "bg-slate-100 text-slate-600 border-slate-200"}`}>
      {s}
    </span>
  );
};

export default AdminOverview;
