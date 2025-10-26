"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { MonthlyTrendData } from "@/types";
import { format, parseISO } from "date-fns";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MonthlyTrendChartProps {
  data: MonthlyTrendData[];
  isLoading?: boolean;
}

export function MonthlyTrendChart({ data, isLoading = false }: MonthlyTrendChartProps) {
  // Calculate total and average
  const totalConversions = data.reduce((sum, item) => sum + item.count, 0);
  const avgMonthly = data.length > 0
    ? (totalConversions / data.length).toFixed(1)
    : "0";

  // Calculate trend (compare last 3 months with previous 3 months)
  const getTrend = () => {
    if (data.length < 6) return { direction: "neutral", percentage: 0 };

    const recentMonths = data.slice(-3);
    const previousMonths = data.slice(-6, -3);

    const recentSum = recentMonths.reduce((sum, item) => sum + item.count, 0);
    const previousSum = previousMonths.reduce((sum, item) => sum + item.count, 0);

    if (previousSum === 0) {
      return { direction: recentSum > 0 ? "up" : "neutral", percentage: 0 };
    }

    const change = ((recentSum - previousSum) / previousSum) * 100;

    return {
      direction: change > 5 ? "up" : change < -5 ? "down" : "neutral",
      percentage: Math.abs(Math.round(change)),
    };
  };

  const trend = getTrend();

  // Format data for recharts
  const chartData = data.map(item => {
    const [year, month] = item.month.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);

    return {
      month: item.month,
      count: item.count,
      formattedMonth: format(date, "MMM yy"),
    };
  });

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const [year, month] = data.month.split("-");
      const date = new Date(parseInt(year), parseInt(month) - 1);

      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium">{format(date, "MMMM yyyy")}</p>
          <p className="text-sm text-muted-foreground mt-1">
            Conversions: <span className="font-semibold text-foreground">{data.count}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Trend icon
  const TrendIcon = () => {
    if (trend.direction === "up") return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend.direction === "down") return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Trends</CardTitle>
          <CardDescription>Last 12 months</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-muted-foreground">Loading chart...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Monthly Trends</CardTitle>
            <CardDescription>Conversion patterns over the last 12 months</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{totalConversions}</div>
            <div className="text-xs text-muted-foreground">Total Conversions</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="h-[300px] flex flex-col items-center justify-center text-center">
            <p className="text-muted-foreground">No monthly data available</p>
            <p className="text-sm text-muted-foreground mt-1">Trends will appear after the first month</p>
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="formattedMonth"
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#colorCount)"
                  dot={{
                    fill: "hsl(var(--primary))",
                    strokeWidth: 2,
                    r: 4,
                    stroke: "hsl(var(--background))",
                  }}
                  activeDot={{
                    r: 6,
                    fill: "hsl(var(--primary))",
                    stroke: "hsl(var(--background))",
                    strokeWidth: 2,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>

            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t">
              <div>
                <div className="text-sm text-muted-foreground">Monthly Average</div>
                <div className="text-2xl font-bold mt-1">{avgMonthly}</div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendIcon />
                  Trend (Last 3 Months)
                </div>
                <div className="text-2xl font-bold mt-1">
                  {trend.direction === "neutral" ? (
                    <span className="text-muted-foreground">Stable</span>
                  ) : (
                    <span className={trend.direction === "up" ? "text-green-500" : "text-red-500"}>
                      {trend.direction === "up" ? "+" : "-"}{trend.percentage}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
