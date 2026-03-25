import React, { useState, useEffect, useMemo } from "react";
import { getAdminOrders } from "../../services/api";
import CustomerDetailsModal from "../../components/admin/customers/CustomerDetailsModal";

interface CustomerData {
  id: string;
  name: string;
  email: string;
  mobile: string;
  location: string;
  totalOrders: number;
  totalSpent: number;
  lastActive: Date;
  orders: any[];
}

const AdminCustomers = () => {
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerData | null>(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        // Fetch a large batch of orders to aggregate customer data
        const res = await getAdminOrders({ page: 1, limit: 2000 });

        let orderList: any[] = [];
        const rawData = res.data.data as any;
        if (rawData?.data && Array.isArray(rawData.data)) orderList = rawData.data;
        else if (rawData?.orders && Array.isArray(rawData.orders)) orderList = rawData.orders;
        else if (Array.isArray(rawData)) orderList = rawData;

        // Group by User ID and Aggregate
        const customerMap = new Map<string, CustomerData>();

        orderList.forEach((order) => {
          // Identify user (handle guest or registered)
          const userId = order.user?.id || order.userId || `guest-${order.address?.email}`;

          if (!customerMap.has(userId)) {
            customerMap.set(userId, {
              id: userId,
              name:
                order.user?.name ||
                order.address?.full_name ||
                order.address?.fullname ||
                "Unknown",
              email: order.user?.email || "N/A",
              mobile: order.user?.mobile || "N/A",
              location: order.address ? `${order.address.city}, ${order.address.state}` : "Unknown",
              totalOrders: 0,
              totalSpent: 0,
              lastActive: new Date(0), // Epoch
              orders: [], // Store simplified order history
            });
          }

          const customer = customerMap.get(userId)!;
          customer.totalOrders += 1;
          customer.totalSpent += Number(order.total_amount || order.totalAmount || 0);
          customer.orders.push(order); // Add full order object

          const orderDate = new Date(order.created_at || order.createdAt);
          if (orderDate > customer.lastActive) {
            customer.lastActive = orderDate;
          }
        });

        setCustomers(Array.from(customerMap.values()));
      } catch (error) {
        console.error("Failed to fetch customers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  // Filter & Pagination Logic
  const filteredCustomers = useMemo(() => {
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [customers, searchTerm]);

  const paginatedCustomers = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredCustomers.slice(start, start + limit);
  }, [filteredCustomers, page, limit]);

  const totalPages = Math.ceil(filteredCustomers.length / limit);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    if (!date || date.getTime() === 0) return "N/A";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="p-4 sm:p-8 pb-12">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 px-2 sm:px-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-800 tracking-tight">
            Customers
          </h1>
          <p className="text-slate-400 mt-1 text-sm lg:text-base font-bold uppercase tracking-widest">
            Found {customers.length} unique customers from order history.
          </p>
        </div>

        {/* Search */}
        <div className="relative group w-full md:w-80">
          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-[1.25rem] text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-300 transition-all shadow-sm"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-indigo-600"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-100/50 overflow-hidden flex flex-col min-h-[650px] transition-all scrollbar-hide">
        <div className="flex items-center justify-between px-6 sm:px-10 py-6 sm:py-8 border-b border-slate-100 bg-slate-50/30">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">
              Customer Network
            </h2>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">
              Aggregated profiles and activity
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-x-auto scrollbar-hide pb-44">
          <table className="w-full text-left min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                <th className="px-10 py-5">Customer</th>
                <th className="px-10 py-5">Contact</th>
                <th className="px-10 py-5">Location</th>
                <th className="px-10 py-5 text-center">Orders</th>
                <th className="px-10 py-5 text-right">Total Spent</th>
                <th className="px-10 py-5 text-right">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    Loading customers...
                  </td>
                </tr>
              ) : paginatedCustomers.length > 0 ? (
                paginatedCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    onClick={() => setSelectedCustomer(customer)}
                    className="hover:bg-slate-50/50 transition-colors cursor-pointer group/row"
                  >
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-[1.25rem] bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-base group-hover/row:scale-110 transition-transform shadow-sm">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 group-hover/row:text-indigo-600 transition-colors flex items-center gap-2">
                            {customer.name}
                            {customer.totalSpent > 5000 && (
                              <span className="text-[10px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded-md border border-amber-100 uppercase tracking-widest">
                                VIP
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                            ID: {customer.id.slice(0, 6)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-slate-600 text-sm tracking-tight">
                          {customer.email}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {customer.mobile}
                        </span>
                      </div>
                    </td>
                    <td className="px-10 py-6 text-sm font-bold text-slate-600 tracking-tight">
                      {customer.location}
                    </td>
                    <td className="px-10 py-6 text-center">
                      <span className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-bold bg-slate-50 text-slate-700 border border-slate-100 shadow-sm transition-transform group-hover/row:scale-110">
                        {customer.totalOrders}
                      </span>
                    </td>
                    <td className="px-10 py-6 text-right font-bold text-slate-800 text-base tracking-tight">
                      {formatCurrency(customer.totalSpent)}
                    </td>
                    <td className="px-10 py-6 text-right">
                      <div className="flex flex-col items-end gap-0.5">
                        <span className="text-sm font-bold text-slate-600 tracking-tight">
                          {formatDate(customer.lastActive)}
                        </span>
                        <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">
                          Recent Activity
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No customers found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Section */}
        <div className="mt-auto px-10 py-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 bg-slate-50/20">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Rows:
              </span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 transition-all shadow-sm"
              >
                {[5, 10, 20, 50].map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Showing <span className="text-slate-800">{(page - 1) * limit + 1}</span>-
              <span className="text-slate-800">{Math.min(page * limit, customers.length)}</span> of{" "}
              <span className="text-slate-800">{customers.length}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-10 h-10 flex items-center justify-center rounded-xl border-2 border-slate-100 bg-white text-slate-400 hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setPage(i + 1)}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl border-2 font-bold text-xs transition-all ${
                    page === i + 1
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100"
                      : "bg-white border-slate-100 text-slate-400 hover:border-indigo-200 hover:text-indigo-600 hover:bg-slate-50"
                  }`}
                >
                  {String(i + 1).padStart(2, "0")}
                </button>
              ))}
            </div>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0}
              className="w-10 h-10 flex items-center justify-center rounded-xl border-2 border-slate-100 bg-white text-slate-400 hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* DETAILS MODAL */}
      <CustomerDetailsModal customer={selectedCustomer} onClose={() => setSelectedCustomer(null)} />
    </div>
  );
};

export default AdminCustomers;
