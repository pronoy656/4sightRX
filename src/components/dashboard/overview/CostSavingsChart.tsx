"use client";
import React, { useEffect, useState } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axiosSecure from "@/components/hook/axiosSecure";

interface MonthlySaving {
    month: string;
    saving: number;
}

export function CostSavingsChart() {
    const [data, setData] = useState<{ name: string; savings: number }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axiosSecure.get("analytics/monthly-saving-cost");
                if (response.data.success) {
                    const formattedData = response.data.data.map((item: MonthlySaving) => ({
                        name: item.month,
                        savings: item.saving,
                    }));
                    setData(formattedData);
                }
            } catch (error) {
                console.error("Error fetching monthly cost savings:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Calculate dynamic ticks or use a default if no data
    const maxSaving = data.length > 0 ? Math.max(...data.map(d => d.savings)) : 1000;
    const yTicks = [0, maxSaving * 0.25, maxSaving * 0.5, maxSaving * 0.75, maxSaving].map(v => Math.round(v));

    return (
        <Card className="bg-white border-slate-100 shadow-sm rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-lg font-bold text-slate-800">
                        Monthly Cost Savings
                    </CardTitle>
                    <p className="text-xs text-slate-400">Total savings across all facilities</p>
                </div>
                <div className="text-[#22C55E] text-3xl font-light">$</div>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
                {loading ? (
                    <div className="text-slate-400 text-sm">Loading chart data...</div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "#94a3b8", fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "#94a3b8", fontSize: 12 }}
                                dx={-10}
                                ticks={yTicks}
                            />
                            <Tooltip
                                cursor={{ fill: "#f8fafc" }}
                                contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                            />
                            <Bar dataKey="savings" radius={[4, 4, 0, 0]} barSize={40}>
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill="#002D54" />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    );
}
