import { io, Socket } from "socket.io-client";

class SocketService {
  private socket: Socket | null = null;
  private connected: boolean = false;

  constructor() {
    this.socket = null;
    this.connected = false;
  }

  connect(): void {
    if (this.socket && this.connected) {
      console.log("Socket already connected");
      return;
    }

    // Use environment variable or fallback to localhost
    const socketUrl =
      ((import.meta as any).env.VITE_SOCKET_URL as string) || "http://localhost:3000";

    this.socket = io(socketUrl, {
      transports: ["websocket", "polling"],
      withCredentials: true,
      autoConnect: true,
    });

    this.socket.on("connect", () => {
      this.connected = true;
      console.log("✅ Socket.IO connected:", this.socket?.id);
    });

    this.socket.on("disconnect", (reason: string) => {
      this.connected = false;
      console.log("❌ Socket.IO disconnected:", reason);
    });

    this.socket.on("connect_error", (error: Error) => {
      console.error("Socket.IO connection error:", error);
    });

    // Example: Listen for order status changes
    this.socket.on("orderStatusChanged", (data: any) => {
      console.log("Order status changed:", data);
      // You can dispatch events or update state here
    });

    // Example: Listen for cart updates
    this.socket.on("cartUpdated", (data: any) => {
      console.log("Cart updated:", data);
    });

    // Example: Listen for admin alerts
    this.socket.on("adminAlert", (data: any) => {
      console.log("Admin alert:", data);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      console.log("Socket.IO disconnected manually");
    }
  }

  // Emit events to server
  emit(event: string, data: any): void {
    if (this.socket && this.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn("Socket not connected. Cannot emit event:", event);
    }
  }

  // Listen to custom events
  on(event: string, callback: (...args: any[]) => void): void {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  // Remove event listener
  off(event: string, callback: (...args: any[]) => void): void {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  // Example methods for specific features
  updateOrderStatus(orderId: string, status: string): void {
    this.emit("orderStatusUpdate", { orderId, status });
  }

  updateCart(userId: string, cartData: any): void {
    this.emit("cartUpdate", { userId, cartData });
  }

  sendAdminNotification(message: string, type: string): void {
    this.emit("adminNotification", { message, type });
  }

  isConnected(): boolean {
    return this.connected;
  }
}

// Export singleton instance
const socketService = new SocketService();
export default socketService;
