"use client";
import React from "react";
import { Users, Building2, UserRound, FileVideo, Clock, TrendingUp, DollarSign, Target } from "lucide-react";
import { StatCard } from "./StatCard";
import { CostSavingsChart } from "./CostSavingsChart";
import { AcceptanceRateChart } from "./AcceptanceRateChart";
import { RecentActivity } from "./RecentActivity";

export default function Overview() {
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
          value="1,247"
          trend="+12%"
          Icon={Users}
          iconBgColor="bg-blue-500/10"
          iconColor="text-blue-500"
        />

        <StatCard
          label="Active Patients"
          value="3,842"
          trend="+8%"
          Icon={UserRound}
          iconBgColor="bg-purple-500/10"
          iconColor="text-purple-500"
        />

        <StatCard
          label="Total Cost Savings"
          value="$157K"
          trend="+18%"
          description="Last 6 months"
          Icon={DollarSign}
          iconBgColor="bg-emerald-500/10"
          iconColor="text-emerald-600"
        />

        <StatCard
          label="Interchanges Made"
          value="2,847"
          trend="+12%"
          description="Last 6 months"
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
