
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { subPromoters, subPromoterSales } from "@/lib/mock-data";

interface SubPromoterSalesChartProps {
  eventId: string;
}

export const SubPromoterSalesChart = ({ eventId }: SubPromoterSalesChartProps) => {
  // Get all sales for this event
  const eventSales = subPromoterSales.filter(sale => sale.eventId === eventId);
  
  // Format data for the chart
  const chartData = eventSales.map(sale => {
    const promoter = subPromoters.find(sp => sp.id === sale.subPromoterId);
    return {
      name: promoter?.name || "Unknown",
      tickets: sale.ticketsSold,
      revenue: sale.totalRevenue
    };
  });

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Sub-Promoter Performance</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart 
            data={chartData} 
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
            <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="tickets" name="Tickets Sold" fill="#8884d8" />
            <Bar yAxisId="right" dataKey="revenue" name="Revenue ($)" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
