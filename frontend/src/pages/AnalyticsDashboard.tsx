import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
  getCreatorDashboardStats,
  reset,
} from "../features/analytics/analyticsSlice";
import { FaTicketAlt, FaMoneyBillWave, FaCalendarAlt } from "react-icons/fa";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
);

const AnalyticsDashboard = () => {
  const dispatch = useAppDispatch();
  const { dashboardStats, isLoading, isError, message } = useAppSelector(
    (state) => state.analytics,
  );

  useEffect(() => {
    dispatch(getCreatorDashboardStats());

    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  const StatCard = ({
    title,
    value,
    icon,
    color,
    trend,
  }: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    trend?: string;
  }) => (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`rounded-xl p-3 ${color}`}>{icon}</div>
            <div className="ml-4">
              <p className="text-sm text-(--color-text-muted)">{title}</p>
              <p className="text-2xl font-semibold text-(--color-text)">
                {value}
              </p>
            </div>
          </div>
          {trend && (
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
              {trend}
            </span>
          )}
        </div>
      </div>
    </Card>
  );

  // Prepare chart data
  const revenueData = {
    labels: dashboardStats?.eventsBreakdown?.map((e) => e.title) || [],
    datasets: [
      {
        label: "Revenue (NGN)",
        data: dashboardStats?.eventsBreakdown?.map((e) => e.revenue) || [],
        backgroundColor: "rgba(99, 102, 241, 0.6)",
        borderColor: "rgba(99, 102, 241, 1)",
        borderWidth: 1,
      },
    ],
  };

  const ticketData = {
    labels: dashboardStats?.eventsBreakdown?.map((e) => e.title) || [],
    datasets: [
      {
        label: "# of Tickets Sold",
        data: dashboardStats?.eventsBreakdown?.map((e) => e.ticketsSold) || [],
        backgroundColor: [
          "rgba(255, 99, 132, 0.6)",
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(75, 192, 192, 0.6)",
          "rgba(153, 102, 255, 0.6)",
          "rgba(255, 159, 64, 0.6)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
  };

  return (
    <div className="min-h-screen pt-4 pb-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 rounded-lg bg-(--color-brand) text-white p-6 shadow-(--shadow-elevated)">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-blue-100">
                Creator Dashboard
              </p>
              <h1 className="text-3xl sm:text-4xl font-semibold">
                Performance Overview
              </h1>
              <p className="mt-2 text-sm text-blue-100">
                Track sales, revenue, and attendance in real time.
              </p>
            </div>
            <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm">
              <p className="text-blue-100">Updated</p>
              <p className="font-semibold">{new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : isError ? (
          <Card className="rounded-md bg-red-50 p-4 mb-4 border border-red-200">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error loading dashboard
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{message}</p>
                </div>
              </div>
            </div>
          </Card>
        ) : dashboardStats ? (
          <>
            {/* Stat Cards Row */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5 mb-8">
              <StatCard
                title="Total Events"
                value={dashboardStats.totalEvents}
                icon={<FaCalendarAlt className="h-6 w-6 text-white" />}
                color="bg-gradient-to-r from-indigo-500 to-indigo-600"
                trend="Active"
              />
              <StatCard
                title="Tickets Sold"
                value={dashboardStats.totalTicketsSold}
                icon={<FaTicketAlt className="h-6 w-6 text-white" />}
                color="bg-gradient-to-r from-green-500 to-green-600"
                trend="Growing"
              />
              <StatCard
                title="Total Revenue"
                value={`NGN ${dashboardStats.totalRevenue.toLocaleString()}`}
                icon={<FaMoneyBillWave className="h-6 w-6 text-white" />}
                color="bg-gradient-to-r from-yellow-500 to-yellow-600"
                trend="This month"
              />
              <StatCard
                title="Checked-In"
                value={dashboardStats.totalAttendeesCheckedIn}
                icon={<FaCalendarAlt className="h-6 w-6 text-white" />}
                color="bg-gradient-to-r from-cyan-500 to-cyan-600"
              />
              <StatCard
                title="Unique Buyers"
                value={dashboardStats.totalUniqueEventeesBought}
                icon={<FaTicketAlt className="h-6 w-6 text-white" />}
                color="bg-gradient-to-r from-purple-500 to-purple-600"
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <Card className="p-6 h-100 flex flex-col">
                <h2 className="text-lg font-semibold text-(--color-text) mb-4">
                  Revenue per Event
                </h2>
                <div className="flex-1 relative">
                  {(dashboardStats.eventsBreakdown?.length ?? 0) > 0 ? (
                    <Bar
                      data={revenueData}
                      options={{ ...chartOptions, maintainAspectRatio: false }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      No revenue data available
                    </div>
                  )}
                </div>
              </Card>

              <Card className="p-6 h-100 flex flex-col">
                <h2 className="text-lg font-semibold text-(--color-text) mb-4">
                  Ticket Sales Distribution
                </h2>
                <div className="flex-1 relative flex justify-center">
                  {(dashboardStats.eventsBreakdown?.length ?? 0) > 0 ? (
                    <div className="w-full max-w-sm">
                      <Doughnut
                        data={ticketData}
                        options={{
                          ...chartOptions,
                          maintainAspectRatio: false,
                        }}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      No ticket data available
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </>
        ) : (
          <Card className="text-center py-12">
            <h3 className="mt-2 text-sm font-medium text-(--color-text)">
              No stats available
            </h3>
            <p className="mt-1 text-sm text-(--color-text-muted)">
              Get started by creating a new event.
            </p>
          </Card>
        )}

        <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Card className="rounded-xl p-4 text-sm text-(--color-text-muted)">
            Tip: Keep events updated to improve conversion and ticket sales.
          </Card>
          <Link to="/events/create">
            <Button size="lg">Create New Event</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
