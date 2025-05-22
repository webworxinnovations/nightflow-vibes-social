
import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface PerformanceData {
  date: string;
  tickets: number;
  revenue: number;
}

interface SubPromoterPerformanceChartProps {
  data: PerformanceData[];
}

export const SubPromoterPerformanceChart = ({ data }: SubPromoterPerformanceChartProps) => {
  return (
    <div className="w-full h-[300px] mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
          <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
          <Tooltip />
          <Legend />
          <Bar yAxisId="left" dataKey="tickets" name="Tickets Sold" fill="#8884d8" />
          <Bar yAxisId="right" dataKey="revenue" name="Revenue ($)" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
