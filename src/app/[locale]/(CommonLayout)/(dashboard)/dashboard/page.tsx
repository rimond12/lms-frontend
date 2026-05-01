"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ActivityFeed } from "@/components/admin/ActivityHistory";
import {
  DollarSign,
  Users,
  BookOpen,
  Layers,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Plus,
  Eye,
  Settings,
  Calendar,
  Award,
  PlayCircle,
  GraduationCap,
  UserPlus,
  CreditCard,
  BarChart3,
  ArrowUpRight,
  Sparkles,
  Activity,
  PieChart as PieChartIcon,
} from "lucide-react";
import { useGetDashboardStatsQuery } from "@/app/redux/api/dashboardApi";
import { useUser } from "@/app/[locale]/@auth/user.provider";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Cell,
} from "recharts";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// StatCard Colors
const statColors: Record<string, { bg: string; icon: string; text: string }> = {
  blue: { bg: "bg-blue-50/50", icon: "bg-blue-600", text: "text-blue-600" },
  emerald: {
    bg: "bg-emerald-50/50",
    icon: "bg-emerald-600",
    text: "text-emerald-600",
  },
  violet: {
    bg: "bg-violet-50/50",
    icon: "bg-violet-600",
    text: "text-violet-600",
  },
  amber: { bg: "bg-amber-50/50", icon: "bg-amber-500", text: "text-amber-600" },
  indigo: {
    bg: "bg-indigo-50/50",
    icon: "bg-indigo-600",
    text: "text-indigo-600",
  },
};

// Stat Card Component
const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  color = "blue",
  delay = 0,
}: {
  title: string;
  value: number | string;
  icon: any;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  color?: "blue" | "emerald" | "violet" | "amber" | "indigo";
  delay?: number;
}) => {
  const c = statColors[color];
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={`relative rounded-2xl p-5 border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden group hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all bg-white/60 backdrop-blur-xl`}
    >
      <div
        className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl opacity-40 ${c.bg} group-hover:scale-150 transition-transform duration-500`}
      />

      <div className="flex items-start justify-between relative z-10">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm ${c.icon}`}
            >
              <Icon size={16} className="text-white" />
            </div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
              {title}
            </p>
          </div>

          <p className="text-3xl font-black text-slate-800 tracking-tight mt-1">
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>

          {trendValue && (
            <div
              className={`inline-flex items-center gap-1.5 mt-3 text-xs font-bold px-2.5 py-1 rounded-full ${
                trend === "up"
                  ? "text-emerald-700 bg-emerald-100/80"
                  : trend === "down"
                    ? "text-red-700 bg-red-100/80"
                    : "text-slate-600 bg-slate-100/80"
              }`}
            >
              {trend === "up" ? (
                <TrendingUp size={14} strokeWidth={3} />
              ) : trend === "down" ? (
                <TrendingDown size={14} strokeWidth={3} />
              ) : null}
              <span>{trendValue}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Quick Action Card
const QuickActionCard = ({
  title,
  description,
  href,
  icon: Icon,
  colorClass = "text-indigo-600 bg-indigo-50",
  delay = 0,
}: {
  title: string;
  description: string;
  href: string;
  icon: any;
  colorClass?: string;
  delay?: number;
}) => {
  return (
    <Link href={href}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay, duration: 0.3 }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="relative bg-white rounded-xl p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100/80 cursor-pointer group hover:shadow-md hover:border-gray-200 transition-all flex items-center justify-between"
      >
        <div className="flex items-center gap-3.5">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${colorClass}`}
          >
            <Icon size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
              {title}
            </p>
            <p className="text-xs text-gray-500 truncate">{description}</p>
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 text-gray-400 transition-colors">
          <ArrowRight
            size={16}
            className="group-hover:translate-x-0.5 transition-transform"
          />
        </div>
      </motion.div>
    </Link>
  );
};

// Recent Payment Row
const PaymentRow = ({ payment, index }: { payment: any; index: number }) => {
  const statusConfig: Record<
    string,
    { bg: string; text: string; dot: string }
  > = {
    approved: {
      bg: "bg-emerald-100/50",
      text: "text-emerald-700",
      dot: "bg-emerald-500",
    },
    pending: {
      bg: "bg-amber-100/50",
      text: "text-amber-700",
      dot: "bg-amber-500",
    },
    rejected: { bg: "bg-red-100/50", text: "text-red-700", dot: "bg-red-500" },
  };

  const status = statusConfig[payment.status] || statusConfig.pending;

  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-100/60 last:border-0 group">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold shadow-sm">
          {payment.studentName?.charAt(0)?.toUpperCase() || "S"}
        </div>
        <div className="min-w-0 leading-tight">
          <p className="text-sm font-bold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
            {payment.studentName}
          </p>
          <p className="text-[11px] font-medium text-slate-400 truncate mt-0.5">
            {payment.batchName || payment.courseName}
          </p>
        </div>
      </div>
      <div className="text-right ml-3 max-w-[100px]">
        <p className="text-sm font-black text-slate-800 truncate">
          ৳{payment.amount?.toLocaleString()}
        </p>
        <div
          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md mt-0.5 ${status.bg}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
          <span
            className={`text-[10px] font-bold uppercase tracking-wide ${status.text}`}
          >
            {payment.status}
          </span>
        </div>
      </div>
    </div>
  );
};

// Recent Enrollment Row
const EnrollmentRow = ({
  enrollment,
  index,
}: {
  enrollment: any;
  index: number;
}) => {
  const batch = enrollment.batchId;
  const course = enrollment.courseId;

  const statusConfig: Record<
    string,
    { bg: string; text: string; dot: string }
  > = {
    completed: {
      bg: "bg-emerald-100/50",
      text: "text-emerald-700",
      dot: "bg-emerald-500",
    },
    pending: {
      bg: "bg-amber-100/50",
      text: "text-amber-700",
      dot: "bg-amber-500",
    },
    partial: {
      bg: "bg-blue-100/50",
      text: "text-blue-700",
      dot: "bg-blue-500",
    },
  };

  const status = statusConfig[enrollment.paymentStatus] || statusConfig.pending;

  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-100/60 last:border-0 group">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-8 h-8 rounded-full bg-linear-to-br from-violet-500 to-fuchsia-500 text-white flex items-center justify-center text-xs font-bold shadow-sm">
          {enrollment.studentInfo?.name?.charAt(0)?.toUpperCase() || "S"}
        </div>
        <div className="min-w-0 leading-tight">
          <p className="text-sm font-bold text-slate-800 truncate group-hover:text-violet-600 transition-colors">
            {enrollment.studentInfo?.name}
          </p>
          <p className="text-[11px] font-medium text-slate-400 truncate mt-0.5">
            {batch?.batchName || course?.title}
          </p>
        </div>
      </div>
      <div className="text-right ml-3">
        <div
          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md mt-0.5 ${status.bg}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
          <span
            className={`text-[10px] font-bold uppercase tracking-wide ${status.text}`}
          >
            {enrollment.paymentStatus}
          </span>
        </div>
      </div>
    </div>
  );
};

// Recharts Tooltip Customization
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 shadow-xl">
        <p className="font-medium mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-300">{entry.name}:</span>
            <span className="font-bold">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Loading Skeleton
const DashboardSkeleton = () => (
  <div className="p-6 lg:p-8 space-y-8 animate-pulse">
    {/* Header Skeleton */}
    <div className="space-y-2">
      <div className="h-8 bg-gray-200 rounded-lg w-64" />
      <div className="h-4 bg-gray-200 rounded w-48" />
    </div>

    {/* Stats Skeleton */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="bg-white rounded-2xl h-32 shadow-sm border border-gray-100"
        />
      ))}
    </div>

    {/* Content Skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white rounded-2xl h-96 shadow-sm border border-gray-100" />
      <div className="bg-white rounded-2xl h-96 shadow-sm border border-gray-100" />
    </div>
  </div>
);

export default function AdminDashboardPage() {
  const { data, isLoading, error } = useGetDashboardStatsQuery(undefined);
  const user = useUser();
  const stats = data?.data;

  // Get current greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  // Format date
  const formatDate = () => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) return <DashboardSkeleton />;

  if (error) {
    return (
      <div className="p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-linear-to-br from-red-50 to-pink-50 border border-red-100 rounded-2xl p-8 text-center max-w-md mx-auto"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Unable to load dashboard
          </h3>
          <p className="text-gray-600 mb-6">
            We couldn't fetch your dashboard data. Please try refreshing the
            page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors"
          >
            Refresh Page
          </button>
        </motion.div>
      </div>
    );
  }

  // Safely Extract Date keys from both arrays
  const revData = Array.isArray(stats?.charts?.revenue)
    ? stats.charts.revenue
    : [];
  const enrData = Array.isArray(stats?.charts?.enrollments)
    ? stats.charts.enrollments
    : [];

  // Create a unified dictionary of dates
  const dateMap: Record<string, any> = {};

  revData.forEach((item: any) => {
    if (item._id)
      dateMap[item._id] = { Revenue: item.amount || 0, Enrollments: 0 };
  });

  enrData.forEach((item: any) => {
    if (item._id) {
      if (dateMap[item._id]) {
        dateMap[item._id].Enrollments = item.count || 0;
      } else {
        dateMap[item._id] = { Revenue: 0, Enrollments: item.count || 0 };
      }
    }
  });

  // Convert to sorted array for Area Chart
  const mergedChartData = Object.keys(dateMap)
    .sort()
    .map((dateString) => {
      return {
        name: new Date(dateString).toLocaleDateString("en-US", {
          weekday: "short",
          day: "numeric",
        }),
        originalDate: dateString,
        Revenue: dateMap[dateString].Revenue,
        Enrollments: dateMap[dateString].Enrollments * 1000, // Multiplier dummy to show secondary axis relation visibly easily if needed, but normally use 2 y-axes. Keeping it 1:1 for now but we'll use separate Y-Axes in recharts.
      };
    });

  // Real data fix without multiplier for proper scaling
  const chartData = Object.keys(dateMap)
    .sort()
    .map((key) => ({
      name: new Date(key).toLocaleDateString("en-US", {
        weekday: "short",
        day: "numeric",
      }),
      Revenue: dateMap[key].Revenue,
      Enrollments: dateMap[key].Enrollments,
    }));

  // Top Batches Data for Recharts
  const topBatchesData = (
    Array.isArray(stats?.batches?.topByStudents)
      ? stats.batches.topByStudents
      : []
  ).map((b: any) => ({
    name:
      b.batchName?.length > 12
        ? b.batchName.substring(0, 12) + ".."
        : b.batchName,
    Students: b.currentStudentCount || 0,
  }));

  return (
    <div className="p-4 md:p-6 lg:p-8 min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Background Decorators */}
      <div className="absolute top-0 left-0 w-full h-[300px] bg-linear-to-br from-indigo-50 via-slate-50 to-emerald-50/30 -z-10" />
      <div className="absolute -top-[200px] -right-[200px] w-[500px] h-[500px] rounded-full bg-indigo-50/50 blur-[100px] -z-10" />

      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">
              {getGreeting()},{" "}
              <span className="text-indigo-600">
                {user?.name?.split(" ")[0] || "Admin"}
              </span>
            </h1>
            <motion.div
              animate={{ rotate: [0, 15, -10, 0] }}
              transition={{
                repeat: Infinity,
                duration: 2.5,
                ease: "easeInOut",
              }}
            >
              <span className="text-2xl">👋</span>
            </motion.div>
          </div>
          <p className="text-slate-500 font-medium text-sm flex items-center gap-2">
            <Calendar size={14} />
            {formatDate()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/manage-courses/add">
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white font-bold rounded-xl shadow-[0_4px_14px_0_rgba(0,0,0,0.15)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.2)] hover:bg-slate-800 transition-all border border-slate-700/50"
            >
              <Plus size={18} strokeWidth={3} />
              <span>Create Course</span>
            </motion.button>
          </Link>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        {/* 
        <StatCard
          title="Total Revenue"
          value={`৳${(stats?.revenue?.total || 0).toLocaleString()}`}
          icon={DollarSign}
          trend="up"
          trendValue="+12.5% vs last month"
          color="indigo"
          delay={0}
        /> 
        */}
        <StatCard
          title="Total Enrollments"
          value={stats?.enrollments?.total || 0}
          icon={Activity}
          trend="up"
          trendValue={`+${stats?.enrollments?.thisWeek || 0} this week`}
          color="indigo"
          delay={0}
        />
        <StatCard
          title="Active Students"
          value={stats?.users?.total || 0}
          icon={Users}
          trend="up"
          trendValue={`+${stats?.users?.newThisWeek || 0} this week`}
          color="blue"
          delay={0.1}
        />
        <StatCard
          title="Total Courses"
          value={stats?.courses?.total || 0}
          icon={BookOpen}
          trend="neutral"
          trendValue="All active"
          color="violet"
          delay={0.2}
        />
        <StatCard
          title="Active Batches"
          value={stats?.batches?.running || 0}
          icon={Layers}
          trend="up"
          trendValue={`+${stats?.batches?.upcoming || 0} upcoming`}
          color="emerald"
          delay={0.3}
        />
      </div>

      {/* Main Analytics Bento Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-6">
        {/* Performance Graph (Spans 8 cols) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-8 bg-white/80 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 p-5 flex flex-col"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Growth Analytics
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Revenue vs Enrollments (Last 30 Days)
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-indigo-500" /> Revenue
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-emerald-400" />{" "}
                Enrollments
              </div>
            </div>
          </div>

          <div className="h-[280px] w-full mt-auto">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorEnr" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e2e8f0"
                    strokeOpacity={0.5}
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 600 }}
                    dy={10}
                  />
                  <YAxis
                    yAxisId="left"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 600 }}
                  />
                  <YAxis yAxisId="right" orientation="right" hide />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{
                      stroke: "#cbd5e1",
                      strokeWidth: 1,
                      strokeDasharray: "4 4",
                    }}
                  />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="Revenue"
                    stroke="#6366f1"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRev)"
                    activeDot={{ r: 6, strokeWidth: 0, fill: "#4f46e5" }}
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="Enrollments"
                    stroke="#34d399"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorEnr)"
                    activeDot={{ r: 6, strokeWidth: 0, fill: "#10b981" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm font-medium text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                Not enough data for analytics
              </div>
            )}
          </div>
        </motion.div>

        {/* Top Batches (Spans 4 cols) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-4 bg-white/80 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 p-5 flex flex-col relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Top Batches</h2>
              <p className="text-xs text-slate-500 font-medium">
                By enrollment count
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
              <PieChartIcon size={14} />
            </div>
          </div>

          <div className="h-[200px] w-full relative z-10">
            {topBatchesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topBatchesData}
                  margin={{ top: 10, right: 0, left: -30, bottom: 0 }}
                >
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 600 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 600 }}
                  />
                  <Tooltip
                    cursor={{ fill: "#f1f5f9", opacity: 0.5 }}
                    content={<CustomTooltip />}
                  />
                  <Bar dataKey="Students" radius={[4, 4, 4, 4]} maxBarSize={24}>
                    {topBatchesData.map((entry: any, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          index === 0
                            ? "#6366f1"
                            : index === 1
                              ? "#818cf8"
                              : index === 2
                                ? "#a5b4fc"
                                : "#c7d2fe"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs font-medium text-slate-400">
                No batch data
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 relative z-10">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                Running
              </p>
              <p className="text-xl font-black text-slate-800">
                {stats?.batches?.running || 0}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                Avg/Batch
              </p>
              <p className="text-xl font-black text-slate-800">
                {stats?.batches?.running > 0
                  ? Math.round(
                      (stats?.enrollments?.total || 0) / stats.batches.running,
                    )
                  : 0}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Action & Logs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-6">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="lg:col-span-3 space-y-3"
        >
          <div className="flex items-center gap-2 mb-2 pl-1">
            <h2 className="text-[14px] font-bold text-slate-800 uppercase tracking-widest bg-white/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/50 shadow-sm inline-block">
              Quick Actions
            </h2>
          </div>
          <div className="flex flex-col gap-2.5">
            <QuickActionCard
              title="Add Course"
              description="Create & publish"
              href="/dashboard/manage-courses/add"
              icon={BookOpen}
              colorClass="text-blue-600 bg-blue-50"
              delay={0}
            />
            <QuickActionCard
              title="Batches"
              description="View schedules"
              href="/dashboard/manage-batches"
              icon={Layers}
              colorClass="text-emerald-600 bg-emerald-50"
              delay={0.1}
            />
            <QuickActionCard
              title="Enrollments"
              description="Track students"
              href="/dashboard/enrollment-manage"
              icon={UserPlus}
              colorClass="text-violet-600 bg-violet-50"
              delay={0.2}
            />
            <QuickActionCard
              title="Certificates"
              description="Issue & manage"
              href="/dashboard/manage-certificates"
              icon={Award}
              colorClass="text-amber-600 bg-amber-50"
              delay={0.3}
            />
          </div>
        </motion.div>

        {/* Recent Payments Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="lg:col-span-5 bg-white/80 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 overflow-hidden flex flex-col"
        >
          <div className="p-4 border-b border-slate-100/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <CreditCard size={16} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-800">Payments</h2>
                <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                  Latest History
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/enrollment-manage"
              className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
            >
              <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className="p-3 max-h-[320px] overflow-y-auto custom-scrollbar">
            {stats?.payments?.recent?.length > 0 ? (
              <div className="flex flex-col">
                {stats.payments.recent
                  .slice(0, 5)
                  .map((payment: any, index: number) => (
                    <PaymentRow
                      key={`${payment._id || "payment"}_${index}`}
                      payment={payment}
                      index={index}
                    />
                  ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-sm font-medium text-slate-400">
                  No recent transactions
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Recent Enrollments Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="lg:col-span-4 bg-white/80 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 overflow-hidden flex flex-col"
        >
          <div className="p-4 border-b border-slate-100/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center text-violet-600">
                <GraduationCap size={16} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-800">
                  Enrollments
                </h2>
                <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                  New Joinees
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/enrollment-manage"
              className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-violet-50 hover:text-violet-600 transition-colors"
            >
              <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className="p-3 max-h-[320px] overflow-y-auto custom-scrollbar">
            {stats?.enrollments?.recent?.length > 0 ? (
              <div className="flex flex-col">
                {stats.enrollments.recent
                  .slice(0, 5)
                  .map((enrollment: any, index: number) => (
                    <EnrollmentRow
                      key={`${enrollment._id || "enrollment"}_${index}`}
                      enrollment={enrollment}
                      index={index}
                    />
                  ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-sm font-medium text-slate-400">
                  No recent enrollments
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Recent Activity Feed */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.85 }}
        className="mb-6"
      >
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 overflow-hidden">
          <div className="p-4 border-b border-slate-100/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Activity size={16} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-800">Recent System Activity</h2>
                <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Live audit trail</p>
              </div>
            </div>
            <Link
              href="/dashboard/manage-activity"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 transition-colors"
            >
              View All
              <ArrowUpRight size={12} />
            </Link>
          </div>
          <div className="p-4">
            <ActivityFeed limit={8} showAvatar={true} />
          </div>
        </div>
      </motion.div>

      {/* Bottom Footer Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white/60 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-white/40 p-5 relative overflow-hidden"
      >
        <div className="absolute top-0 right-1/2 w-64 h-64 bg-emerald-50/50 rounded-full blur-[80px] -z-10 transform translate-x-1/2 -translate-y-1/2" />
        <div className="text-center p-3 border-r border-slate-100/50 last:border-0">
          <div className="flex items-center justify-center gap-2 mb-1">
            <CheckCircle size={16} className="text-emerald-500" />
            <span className="text-xl font-bold text-slate-800">
              {stats?.courses?.active || 0}
            </span>
          </div>
          <p className="text-[11px] uppercase font-bold tracking-widest text-slate-400">
            Active Courses
          </p>
        </div>
        <div className="text-center p-3 border-r border-slate-100/50 last:border-0">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Clock size={16} className="text-amber-500" />
            <span className="text-xl font-bold text-slate-800">
              {stats?.payments?.pendingCount || 0}
            </span>
          </div>
          <p className="text-[11px] uppercase font-bold tracking-widest text-slate-400">
            Pending Dues
          </p>
        </div>
        <div className="text-center p-3 border-r border-slate-100/50 last:border-0 md:border-r-0 lg:border-r">
          <div className="flex items-center justify-center gap-2 mb-1">
            <BarChart3 size={16} className="text-blue-500" />
            <span className="text-xl font-bold text-slate-800">
              {stats?.enrollments?.total || 0}
            </span>
          </div>
          <p className="text-[11px] uppercase font-bold tracking-widest text-slate-400">
            Total Enrolled
          </p>
        </div>
        <div className="text-center p-3">
          <div className="flex items-center justify-center gap-2 mb-1">
            <PlayCircle size={16} className="text-violet-500" />
            <span className="text-xl font-bold text-slate-800">
              {stats?.batches?.running || 0}
            </span>
          </div>
          <p className="text-[11px] uppercase font-bold tracking-widest text-slate-400">
            Live Batches
          </p>
        </div>
      </motion.div>
    </div>
  );
}
