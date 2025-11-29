"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Calendar, CheckCircle, Clock, TrendingUp, Users } from "lucide-react";

interface Metrics {
  today: number;
  week: number;
  month: number;
  total: number;
  done: number;
  passRate: number;
}

export default function MetricsPage() {
  const [metrics, setMetrics] = useState<Metrics>({
    today: 0,
    week: 0,
    month: 0,
    total: 0,
    done: 0,
    passRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const response = await fetch("/api/interviews");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Response is not JSON");
        }
        const data = await response.json();
        
        if (data.metrics) {
          setMetrics(data.metrics);
        }
      } catch (error) {
        console.error("Error loading metrics:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMetrics();
    const interval = setInterval(loadMetrics, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const statCards = useMemo(() => [
    {
      title: "Today",
      value: metrics.today,
      icon: Calendar,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "This Week",
      value: metrics.week,
      icon: Clock,
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
    },
    {
      title: "This Month",
      value: metrics.month,
      icon: BarChart3,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Total",
      value: metrics.total,
      icon: Users,
      color: "text-green-400",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Completed",
      value: metrics.done,
      icon: CheckCircle,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
    },
    {
      title: "Pass Rate",
      value: `${metrics.passRate}%`,
      icon: TrendingUp,
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/10",
    },
  ], [metrics]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-slate-400">Loading metrics...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl space-y-6 p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">Interview Metrics</h2>
        <p className="mt-2 text-sm text-slate-400">
          Track your interview pipeline performance and statistics
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.title}
              className="border-white/10 bg-slate-900/60 backdrop-blur"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">
                  {stat.title}
                </CardTitle>
                <div className={`rounded-lg ${stat.bgColor} p-2`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{stat.value}</div>
                {stat.title === "Pass Rate" && (
                  <p className="mt-2 text-xs text-slate-400">
                    {metrics.total > 0
                      ? `${metrics.done} of ${metrics.total} interviews completed`
                      : "No data available"}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Additional metrics section */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border-white/10 bg-slate-900/60 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white">
              Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Active Interviews</span>
              <span className="text-lg font-semibold text-white">
                {metrics.total - metrics.done}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Completion Rate</span>
              <span className="text-lg font-semibold text-white">
                {metrics.total > 0
                  ? `${Math.round((metrics.done / metrics.total) * 100)}%`
                  : "0%"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-slate-900/60 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white">
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">This Week</span>
              <span className="text-lg font-semibold text-white">
                {metrics.week} interviews
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">This Month</span>
              <span className="text-lg font-semibold text-white">
                {metrics.month} interviews
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

