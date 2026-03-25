import React, { useState, useEffect, useCallback } from "react";
import OrderTable from "../../components/admin/orders/OrderTable";
import OrderDetailsModal from "../../components/admin/orders/OrderDetailsModal";
import { getAdminOrders } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { Order, OrderMeta } from "../../types";

const AdminOrders: React.FC = () => {
  const [allOrders, setAllOrders] = useState<Order[]>([]); // Store ALL fetched orders
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]); // Orders to display (paginated)
  const [loading, setLoading] = useState<boolean>(true);
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const { showToast } = useToast();

  // Pagination & Filter State
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [meta, setMeta] = useState<OrderMeta | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch large batch to enable client-side filter/page for now since API pagination is unreliable
      const res = await getAdminOrders({ page: 1, limit: 1000 });

      // Handle different response structures gracefully
      const rawData = res.data;
      let orderList: Order[] = [];

      if (rawData?.data && Array.isArray(rawData.data)) {
        orderList = rawData.data;
      } else if ((rawData as any)?.orders && Array.isArray((rawData as any).orders)) {
        orderList = (rawData as any).orders;
      } else if (Array.isArray(rawData)) {
        orderList = rawData as Order[];
      }

      setAllOrders(orderList);
    } catch (error) {
      console.error("Failed to fetch admin orders:", error);
      showToast("Failed to load orders", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Apply Filter and Pagination
  useEffect(() => {
    let result = [...allOrders];

    // 1. Filter
    if (statusFilter !== "ALL") {
      result = result.filter(
        (o) =>
          (o.status || o.orderStatus || (o as any).order_status || "PENDING").toUpperCase() ===
          statusFilter,
      );
    }

    // 2. Pagination Logic (Client Side)
    const totalItems = result.length;
    const totalPages = Math.ceil(totalItems / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedResult = result.slice(startIndex, endIndex);

    setFilteredOrders(paginatedResult);
    setMeta({
      total: totalItems,
      totalPages: totalPages,
      page: page,
      limit: limit,
    });
  }, [allOrders, statusFilter, page, limit]);

  // Reset page on filter change
  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Refresh list when an order is updated
  const handleOrderUpdated = (updatedOrder: Order | null) => {
    if (updatedOrder) {
      // "Silent" update: Patch the local state directly to avoid a full re-fetch loading spinner
      setAllOrders((prev) =>
        prev.map((o) =>
          o.id === (updatedOrder.id || updatedOrder._id) ||
          o._id === (updatedOrder.id || updatedOrder._id)
            ? { ...o, ...updatedOrder }
            : o,
        ),
      );
    } else {
      // Fallback: Full refresh if no data provided
      fetchOrders();
    }
  };

  return (
    <div className="p-4 sm:p-8 pb-12">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10 px-2 sm:px-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-800 tracking-tight">
            Orders Management
          </h1>
          <p className="text-slate-400 mt-1 text-sm lg:text-base font-bold uppercase tracking-widest">
            View and manage customer orders.
          </p>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-3">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Filter:
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-300 transition-all p-3 shadow-sm min-w-[150px]"
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-100/50 overflow-hidden flex flex-col min-h-[650px] transition-all scrollbar-hide">
        <div className="flex items-center justify-between px-6 sm:px-10 py-6 sm:py-8 border-b border-slate-100 bg-slate-50/30">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">
              Order Pipeline
            </h2>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">
              Live transaction monitoring
            </p>
          </div>
        </div>

        <div className="p-0 flex-1 flex flex-col min-h-0">
          <OrderTable
            orders={filteredOrders}
            loading={loading}
            setViewOrder={setViewOrder}
            meta={meta}
            page={page}
            setPage={setPage}
            limit={limit}
            setLimit={setLimit}
          />
        </div>
      </div>

      <OrderDetailsModal
        viewOrder={viewOrder}
        setViewOrder={setViewOrder}
        onOrderUpdated={handleOrderUpdated}
      />
    </div>
  );
};

export default AdminOrders;
