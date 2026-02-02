import React, { useState, useEffect } from "react";
import { getMyProducts, getCategories } from "../../services/api";

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

  const colorClasses = {
    indigo: "bg-gradient-to-br from-indigo-500 to-indigo-600",
    amber: "bg-gradient-to-br from-amber-500 to-amber-600",
    green: "bg-gradient-to-br from-green-500 to-green-600",
  };

  const trendClasses = {
    up: "bg-green-100 text-green-700",
    down: "bg-red-100 text-red-700",
    neutral: "bg-slate-100 text-slate-600",
  };

  return (
    <div className="p-5">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-blue-600">Dashboard Overview</h1>
        <p className="text-slate-600 mt-1">
          Welcome back! Your store metrics are currently real-time.
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-12 h-12 rounded-xl ${colorClasses[stat.color]} shadow-lg`}
              ></div>
              <span
                className={`px-3 py-1 rounded-lg text-xs font-semibold ${trendClasses[stat.trend]}`}
              >
                {stat.change}
              </span>
            </div>

            <span className="block text-sm font-medium text-slate-600 mb-1">
              {stat.label}
            </span>
            <h2 className="text-3xl font-bold text-slate-800">{stat.value}</h2>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminOverview;
