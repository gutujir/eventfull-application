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
  }: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
  }) => (
    <div className="bg-white overflow-hidden shadow rounded-lg transform hover:scale-105 transition-transform duration-300">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`rounded-md p-3 ${color}`}>{icon}</div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd>
                <div className="text-lg font-medium text-gray-900">{value}</div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
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
    <div className="bg-gray-50 min-h-screen pt-8 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 p-4 bg-white rounded-lg shadow-sm border-l-4 border-indigo-500">
          <h1 className="text-3xl font-extrabold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-sm text-gray-700">
            Real-time overview of your events, ticket sales, and revenue.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : isError ? (
          <div className="rounded-md bg-red-50 p-4 mb-4 border border-red-200">
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
          </div>
        ) : dashboardStats ? (
          <>
            {/* Stat Cards Row */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
              <StatCard
                title="Total Events"
                value={dashboardStats.totalEvents}
                icon={<FaCalendarAlt className="h-6 w-6 text-white" />}
                color="bg-gradient-to-r from-indigo-500 to-indigo-600"
              />
              <StatCard
                title="Tickets Sold"
                value={dashboardStats.totalTicketsSold}
                icon={<FaTicketAlt className="h-6 w-6 text-white" />}
                color="bg-gradient-to-r from-green-500 to-green-600"
              />
              <StatCard
                title="Total Revenue"
                value={`NGN ${dashboardStats.totalRevenue.toLocaleString()}`}
                icon={<FaMoneyBillWave className="h-6 w-6 text-white" />}
                color="bg-gradient-to-r from-yellow-500 to-yellow-600"
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-white p-6 rounded-lg shadow h-[400px] flex flex-col">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
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
              </div>

              <div className="bg-white p-6 rounded-lg shadow h-[400px] flex flex-col">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
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
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No stats available
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new event.
            </p>
          </div>
        )}

        <div className="mt-8">
          <div className="flex justify-end">
            <Link
              to="/create-event"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Create New Event
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
