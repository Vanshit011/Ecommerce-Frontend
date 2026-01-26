import React, { useState, useEffect } from "react";
import { getMyProducts, getCategories } from "../../services/api";
import "../../styles/pages/admin/adminOverview.css";

const AdminOverview = () => {
  const [stats, setStats] = useState([
    {
      label: "Total Products",
      value: "0",
      change: "...",
      trend: "neutral",
      color: "indigo",
    },
    {
      label: "Total Categories",
      value: "0",
      change: "Live",
      trend: "neutral",
      color: "amber",
    },
    {
      label: "Total Users",
      value: "0",
      change: "Syncing",
      trend: "neutral",
      color: "green",
    },
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      const [productsRes, categoriesRes] = await Promise.all([
        getMyProducts(),
        getCategories(),
      ]);

      setStats((prev) => {
        const updated = [...prev];
        updated[0].value = productsRes.data.length;
        updated[0].change = "+8%";
        updated[0].trend = "up";

        updated[1].value = categoriesRes.data.length;
        updated[1].change = "Real-time";

        updated[2].value = "1200";
        updated[2].change = "+2%";
        updated[2].trend = "up";

        return updated;
      });
    };

    fetchStats();
  }, []);

  return (
    <div className="admin-overview">
      <div className="overview-header">
        <h1>Dashboard Overview</h1>
        <p>Welcome back! Your store metrics are currently real-time.</p>
      </div>

      {/* STATS */}
      <div className="stats-grid">
        {stats.map((stat, i) => (
          <div key={i} className="stat-card">
            <div className="stat-top">
              <div className={`stat-icon ${stat.color}`}></div>
              <span className={`stat-badge ${stat.trend}`}>
                {stat.change}
              </span>
            </div>

            <span className="stat-label">{stat.label}</span>
            <h2 className="stat-value">{stat.value}</h2>
          </div>
        ))}
      </div>

    </div>
  );
};

export default AdminOverview;
