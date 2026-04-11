"use client";
import React, { useEffect, useState } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import axiosSecure from "@/components/hook/axiosSecure";

interface AcceptanceRate {
    month: string;
    acceptanceRate: number;
}

export function AcceptanceRateChart() {
    const [data, setData] = useState<{ name: string; rate: number }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axiosSecure.get("analytics/acceptance-rate");
                if (response.data.success) {
                    const formattedData = response.data.data.map((item: AcceptanceRate) => ({
                        name: item.month,
                        rate: item.acceptanceRate,
                    }));
                    setData(formattedData);
                }
            } catch (error) {
                console.error("Error fetching acceptance rate:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <Card className="bg-white border-slate-100 shadow-sm rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-lg font-bold text-slate-800">
                        Recommendation Acceptance Rate
                    </CardTitle>
                    <p className="text-xs text-slate-400">Percentage of accepted therapeutic interchanges</p>
                </div>
                <TrendingUp className="text-[#002D54] h-6 w-6" />
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
                {loading ? (
                    <div className="text-slate-400 text-sm">Loading chart data...</div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
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
                                domain={[0, 100]}
                                ticks={[0, 25, 50, 75, 100]}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                            />
                            <Line
                                type="monotone"
                                dataKey="rate"
                                stroke="#002D54"
                                strokeWidth={3}
                                dot={{ fill: "#002D54", r: 4, strokeWidth: 2, stroke: "#fff" }}
                                activeDot={{ r: 6, strokeWidth: 0 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    );
}
