"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { DailyUsageData } from "@/types";
import { format, parseISO } from "date-fns";
import { TrendingUp } from "lucide-react";

interface DailyUsageChartProps {
  data: DailyUsageData[];
  isLoading?: boolean;
}

export function DailyUsageChart({ data, isLoading = false }: DailyUsageChartProps) {
  // Calculate total conversions
  const totalConversions = data.reduce((sum, item) => sum + item.count, 0);

  // Calculate average daily conversions
  const avgConversions = data.length > 0
    ? (totalConversions / data.length).toFixed(1)
    : "0";

  // Find peak day
  const peakDay = data.reduce((max, item) =>
    item.count > max.count ? item : max
  , { count: 0, date: "" });

  // Format data for recharts
  const chartData = data.map(item => ({
    date: item.date,
    count: item.count,
    formattedDate: format(parseISO(item.date), "MMM dd"),
  }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium">{format(parseISO(data.date), "MMMM dd, yyyy")}</p>
          <p className="text-sm text-muted-foreground mt-1">
            Conversions: <span className="font-semibold text-foreground">{data.count}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Daily Usage</CardTitle>
          <CardDescription>Last 30 days</CardDescription>
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
            <CardTitle>Daily Usage</CardTitle>
            <CardDescription>Conversion activity over the last 30 days</CardDescription>
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
            <p className="text-muted-foreground">No conversion data available</p>
            <p className="text-sm text-muted-foreground mt-1">Data will appear once the user starts converting images</p>
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="formattedDate"
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))' }} />
                <Bar
                  dataKey="count"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.count === peakDay.count && entry.count > 0
                        ? "hsl(var(--primary))"
                        : "hsl(var(--primary) / 0.6)"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t">
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  Average Daily
                </div>
                <div className="text-2xl font-bold mt-1">{avgConversions}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Peak Day</div>
                <div className="text-2xl font-bold mt-1">{peakDay.count}</div>
                {peakDay.date && (
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {format(parseISO(peakDay.date), "MMM dd")}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
