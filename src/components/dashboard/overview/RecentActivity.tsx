"use client";
import React, { useEffect, useState } from "react";
import {
    UserPlus,
    FileText,
    UserCheck,
    CheckCircle2,
    Settings,
    Clock,
    Activity
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import axiosSecure from "@/components/hook/axiosSecure";

interface ActivityItem {
    _id: string;
    name: string;
    action: string;
    timeAgo: string;
}

export function RecentActivity() {
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                const response = await axiosSecure.get("/analytics/recent-activities");
                if (response.data.success) {
                    setActivities(response.data.data);
                }
            } catch (error) {
                console.error("Error fetching recent activities:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchActivities();
    }, []);

    const getIconForAction = (action: string) => {
        const lowerAction = action.toLowerCase();
        if (lowerAction.includes("patient")) return { Icon: UserCheck, bg: "bg-emerald-50", color: "text-emerald-600" };
        if (lowerAction.includes("user")) return { Icon: UserPlus, bg: "bg-blue-50", color: "text-blue-600" };
        if (lowerAction.includes("approved") || lowerAction.includes("completed")) return { Icon: CheckCircle2, bg: "bg-indigo-50", color: "text-indigo-600" };
        if (lowerAction.includes("update") || lowerAction.includes("edit")) return { Icon: FileText, bg: "bg-purple-50", color: "text-purple-600" };
        return { Icon: Activity, bg: "bg-slate-100", color: "text-slate-600" };
    };

    return (
        <Card className="bg-white border-slate-100 shadow-sm rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-6">
                <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-slate-800" />
                    <CardTitle className="text-lg font-bold text-slate-800">
                        Recent Activity
                    </CardTitle>
                </div>
                <button className="text-[#00A3A3] text-sm font-semibold hover:underline">
                    View All
                </button>
            </CardHeader>
            <CardContent className="p-0">
                {loading ? (
                    <div className="p-8 text-center text-slate-400 text-sm">Loading activities...</div>
                ) : activities.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-sm">No recent activities found.</div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {activities.map((activity) => {
                            const { Icon, bg, color } = getIconForAction(activity.action);
                            return (
                                <div key={activity._id} className="flex items-center justify-between p-4 px-6 hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", bg)}>
                                            <Icon className={cn("h-5 w-5", color)} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-800">{activity.action}</p>
                                            <p className="text-xs text-slate-400">{activity.name}</p>
                                        </div>
                                    </div>
                                    <div className="text-xs text-slate-400 whitespace-nowrap">
                                        {activity.timeAgo}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
