import React, { useState, useEffect, useCallback } from "react";
import OrderTable from "../../components/admin/orders/OrderTable";
import OrderDetailsModal from "../../components/admin/orders/OrderDetailsModal";
import { getAdminOrders } from "../../services/api";
import { useToast } from "../../context/ToastContext";

const AdminOrders = () => {
  const [allOrders, setAllOrders] = useState([]); // Store ALL fetched orders
  const [filteredOrders, setFilteredOrders] = useState([]); // Orders to display (paginated)
  const [loading, setLoading] = useState(true);
  const [viewOrder, setViewOrder] = useState(null);
  const { showToast } = useToast();

  // Pagination & Filter State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [meta, setMeta] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch large batch to enable client-side filter/page for now since API pagination is unreliable
      const res = await getAdminOrders({ page: 1, limit: 1000 });

      // Handle different response structures gracefully
      const rawData = res.data;
      let orderList = [];

      if (rawData?.data && Array.isArray(rawData.data)) {
        orderList = rawData.data;
      } else if (rawData?.orders && Array.isArray(rawData.orders)) {
        orderList = rawData.orders;
      } else if (Array.isArray(rawData)) {
        orderList = rawData;
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
        (o) => (o.status || o.orderStatus || "PENDING").toUpperCase() === statusFilter,
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
  const handleOrderUpdated = (updatedOrder) => {
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
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Orders Management</h1>
          <p className="text-slate-500 text-sm mt-1">View and manage customer orders.</p>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-600">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
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

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 md:p-6">
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

      <OrderDetailsModal
        viewOrder={viewOrder}
        setViewOrder={setViewOrder}
        onOrderUpdated={handleOrderUpdated}
      />
    </div>
  );
};

export default AdminOrders;
