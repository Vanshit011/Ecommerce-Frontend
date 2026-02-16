import { io } from "socket.io-client";

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
  }

  connect() {
    if (this.socket && this.connected) {
      console.log("Socket already connected");
      return;
    }

    // Use environment variable or fallback to localhost
    const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:3000";

    this.socket = io(socketUrl, {
      transports: ["websocket", "polling"],
      withCredentials: true,
      autoConnect: true,
    });

    this.socket.on("connect", () => {
      this.connected = true;
      console.log("✅ Socket.IO connected:", this.socket.id);
    });

    this.socket.on("disconnect", (reason) => {
      this.connected = false;
      console.log("❌ Socket.IO disconnected:", reason);
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket.IO connection error:", error);
    });

    // Example: Listen for order status changes
    this.socket.on("orderStatusChanged", (data) => {
      console.log("Order status changed:", data);
      // You can dispatch events or update state here
    });

    // Example: Listen for cart updates
    this.socket.on("cartUpdated", (data) => {
      console.log("Cart updated:", data);
    });

    // Example: Listen for admin alerts
    this.socket.on("adminAlert", (data) => {
      console.log("Admin alert:", data);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      console.log("Socket.IO disconnected manually");
    }
  }

  // Emit events to server
  emit(event, data) {
    if (this.socket && this.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn("Socket not connected. Cannot emit event:", event);
    }
  }

  // Listen to custom events
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  // Remove event listener
  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  // Example methods for specific features
  updateOrderStatus(orderId, status) {
    this.emit("orderStatusUpdate", { orderId, status });
  }

  updateCart(userId, cartData) {
    this.emit("cartUpdate", { userId, cartData });
  }

  sendAdminNotification(message, type) {
    this.emit("adminNotification", { message, type });
  }

  isConnected() {
    return this.connected;
  }
}

// Export singleton instance
const socketService = new SocketService();
export default socketService;
