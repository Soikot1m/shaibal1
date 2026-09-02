"use client";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, PieChart, Pie, Cell, Legend } from "recharts";

const COLORS = ["#0ea5e9", "#14b8a6", "#6366f1", "#f59e0b", "#ef4444", "#10b981", "#8b5cf6", "#ec4899", "#64748b"];
const fmt = (v: number) => `৳${(v / 1000).toFixed(v >= 100000 ? 0 : 1)}k`;

export function RevenueChart({ data }: { data: { label: string; revenue: number; bookings: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ left: -10, right: 10, top: 10 }}>
        <defs>
          <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.5} /><stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} /></linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.15)" />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
        <YAxis tickFormatter={fmt} tick={{ fontSize: 11 }} />
        <Tooltip formatter={(v) => `৳${Number(v).toLocaleString()}`} contentStyle={{ borderRadius: 12, border: "1px solid rgba(0,0,0,0.08)" }} />
        <Area type="monotone" dataKey="revenue" stroke="#0ea5e9" strokeWidth={2.5} fill="url(#rev)" name="Revenue" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function BookingsChart({ data }: { data: { label: string; bookings: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ left: -20, right: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.15)" />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
        <Tooltip contentStyle={{ borderRadius: 12 }} />
        <Bar dataKey="bookings" fill="#14b8a6" radius={[8, 8, 0, 0]} name="Bookings" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function BreakdownPie({ data, height = 240 }: { data: { name: string; value: number }[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip formatter={(v) => `৳${Number(v).toLocaleString()}`} contentStyle={{ borderRadius: 12 }} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function HorizontalBars({ data }: { data: { name: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(160, data.length * 36)}>
      <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20 }}>
        <XAxis type="number" hide />
        <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 11 }} />
        <Tooltip contentStyle={{ borderRadius: 12 }} />
        <Bar dataKey="value" fill="#0ea5e9" radius={[0, 8, 8, 0]} name="Travelers" />
      </BarChart>
    </ResponsiveContainer>
  );
}
