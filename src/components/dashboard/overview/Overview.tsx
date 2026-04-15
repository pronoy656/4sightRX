"use client";
import React, { useEffect, useState } from "react";
import { Users, UserRound, TrendingUp, DollarSign } from "lucide-react";
import { StatCard } from "./StatCard";
import { CostSavingsChart } from "./CostSavingsChart";
import { AcceptanceRateChart } from "./AcceptanceRateChart";
import { RecentActivity } from "./RecentActivity";
import axiosSecure from "@/components/hook/axiosSecure";

interface DashboardStats {
  totalUsers: number;
  totalCostSavings: number;
  totalActivePatients: number;
  totalInterchangeMode: number;
}

export default function Overview() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axiosSecure.get("analytics/dashboard/analytics");
        if (response.data.success) {
          setStats(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching dashboard analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatValue = (val: number) => {
    return new Intl.NumberFormat('en-US').format(val);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Dashboard Overview</h1>
        <p className="text-slate-500 mt-1 font-medium">
          Monitor system activity and key performance indicators
        </p>
      </div>

      {/* Row 1: Main Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          label="Total Users"
          value={loading ? "..." : formatValue(stats?.totalUsers || 0)}

          Icon={Users}
          iconBgColor="bg-blue-500/10"
          iconColor="text-blue-500"
        />

        <StatCard
          label="Active Patients"
          value={loading ? "..." : formatValue(stats?.totalActivePatients || 0)}
          Icon={UserRound}
          iconBgColor="bg-purple-500/10"
          iconColor="text-purple-500"
        />

        <StatCard
          label="Total Cost Savings"
          value={loading ? "..." : `$${formatValue(stats?.totalCostSavings || 0)}`}
          // description="Total accumulated savings"
          Icon={DollarSign}
          iconBgColor="bg-emerald-500/10"
          iconColor="text-emerald-600"
        />

        <StatCard
          label="Interchanges Made"
          value={loading ? "..." : formatValue(stats?.totalInterchangeMode || 0)}
          // description="Total therapeutic interchanges"
          Icon={TrendingUp}
          iconBgColor="bg-orange-500/10"
          iconColor="text-orange-600"
        />
      </div>

      {/* Row 2: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CostSavingsChart />
        <AcceptanceRateChart />
      </div>

      {/* Row 4: Recent Activity */}
      <div className="grid grid-cols-1">
        <RecentActivity />
      </div>
    </div>
  );
}
