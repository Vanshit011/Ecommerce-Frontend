import { useEffect } from "react";
import socketService from "../services/socketService";

/**
 * Example component showing how to use Socket.IO in your React app
 *
 * Usage:
 * 1. Import this component in your App.jsx or main layout
 * 2. The socket will auto-connect when the component mounts
 * 3. Use socketService methods anywhere in your app to emit/listen to events
 */
function SocketExample() {
  useEffect(() => {
    // Connect to Socket.IO server
    socketService.connect();

    // Example: Listen for order status changes
    const handleOrderStatusChange = (data) => {
      console.log("📦 Order status changed:", data);
      // Update your UI state here
      // e.g., dispatch({ type: 'UPDATE_ORDER_STATUS', payload: data });
    };

    // Example: Listen for cart updates
    const handleCartUpdate = (data) => {
      console.log("🛒 Cart updated:", data);
      // Update cart state
    };

    // Example: Listen for admin alerts
    const handleAdminAlert = (data) => {
      console.log("🔔 Admin alert:", data);
      // Show notification
    };

    // Register event listeners
    socketService.on("orderStatusChanged", handleOrderStatusChange);
    socketService.on("cartUpdated", handleCartUpdate);
    socketService.on("adminAlert", handleAdminAlert);

    // Cleanup on unmount
    return () => {
      socketService.off("orderStatusChanged", handleOrderStatusChange);
      socketService.off("cartUpdated", handleCartUpdate);
      socketService.off("adminAlert", handleAdminAlert);
      socketService.disconnect();
    };
  }, []);

  // Example: Emit events from your components
  const handleUpdateOrder = () => {
    socketService.updateOrderStatus("order-123", "SHIPPED");
  };

  const handleUpdateCart = () => {
    socketService.updateCart("user-456", { items: [], total: 0 });
  };

  const handleSendNotification = () => {
    socketService.sendAdminNotification("New order received!", "info");
  };

  return (
    <div style={{ padding: "20px", border: "1px solid #ccc", margin: "20px" }}>
      <h2>Socket.IO Example</h2>
      <p>
        Connection Status:{" "}
        <strong style={{ color: socketService.isConnected() ? "green" : "red" }}>
          {socketService.isConnected() ? "Connected ✅" : "Disconnected ❌"}
        </strong>
      </p>

      <div style={{ marginTop: "20px" }}>
        <h3>Test Events:</h3>
        <button onClick={handleUpdateOrder} style={{ margin: "5px" }}>
          Update Order Status
        </button>
        <button onClick={handleUpdateCart} style={{ margin: "5px" }}>
          Update Cart
        </button>
        <button onClick={handleSendNotification} style={{ margin: "5px" }}>
          Send Admin Notification
        </button>
      </div>

      <div style={{ marginTop: "20px", fontSize: "12px", color: "#666" }}>
        <p>Open browser console (F12) to see Socket.IO events</p>
      </div>
    </div>
  );
}

export default SocketExample;
