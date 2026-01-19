// frontent/src/components/Analytics-Dashboard.jsx
import axios from 'axios';
import { format, isSameDay, startOfMonth, subDays } from 'date-fns';
import React, { useEffect, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { getApiBaseUrl } from '../config/api';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from './context/AuthContext';

// UI Components
const Card = ({ className, ...props }) => {
  const { theme } = useTheme();
  return (
    <div
      className={`rounded-lg border shadow-sm ${
        theme === 'dark' ? 'bg-[#1a1b2e] border-gray-700' : 'bg-white border-gray-200'
      } ${className}`}
      {...props}
    />
  );
};

const CardHeader = ({ className, ...props }) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props} />
);

const CardTitle = ({ className, ...props }) => (
  <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`} {...props} />
);

const CardDescription = ({ className, ...props }) => (
  <p className={`text-sm text-gray-500 ${className}`} {...props} />
);

const CardContent = ({ className, ...props }) => (
  <div className={`p-6 pt-0 ${className}`} {...props} />
);

const Button = ({ variant = 'default', size = 'default', className = '', children, ...props }) => {
  const { theme } = useTheme();
  const baseStyles =
    'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';

  const variants = {
    default:
      theme === 'dark'
        ? 'bg-blue-600 text-white hover:bg-blue-700'
        : 'bg-blue-600 text-white hover:bg-blue-700',
    outline:
      theme === 'dark'
        ? 'border border-gray-600 bg-transparent hover:bg-gray-800 text-white hover:text-white'
        : 'border border-gray-300 bg-transparent hover:bg-gray-100 text-gray-700 hover:text-gray-900',
    secondary:
      theme === 'dark'
        ? 'bg-gray-700 text-white hover:bg-gray-600'
        : 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    ghost:
      theme === 'dark'
        ? 'hover:bg-gray-800 text-white hover:text-white'
        : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900',
    link:
      theme === 'dark'
        ? 'text-blue-400 hover:text-blue-300 hover:underline'
        : 'text-blue-600 hover:text-blue-800 hover:underline',
  };

  const sizes = {
    default: 'h-10 py-2 px-4',
    sm: 'h-9 px-3 rounded-md',
    lg: 'h-11 px-8 rounded-md',
    icon: 'h-10 w-10',
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
};

const Popover = ({ children }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      {React.Children.map(children, (child) => {
        if (child.type === PopoverTrigger) {
          return React.cloneElement(child, { open, setOpen });
        }
        if (child.type === PopoverContent) {
          return open ? React.cloneElement(child, { setOpen }) : null;
        }
        return child;
      })}
    </div>
  );
};

const PopoverTrigger = ({ children, open, setOpen }) => {
  return React.cloneElement(children, {
    onClick: () => setOpen(!open),
  });
};

const PopoverContent = ({ children, className = '', setOpen, ...props }) => {
  const ref = React.useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setOpen]);

  return (
    <div
      ref={ref}
      className={`z-50 w-72 rounded-md border bg-white p-4 text-gray-900 shadow-md outline-none ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

const Calendar = ({ selected, onSelect, numberOfMonths = 1, className = '' }) => {
  const today = new Date();
  const [month, setMonth] = useState(selected?.from || today);

  const daysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getDays = (date) => {
    const days = [];
    const daysCount = daysInMonth(date);
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10"></div>);
    }

    // Add days of the month
    for (let i = 1; i <= daysCount; i++) {
      const day = new Date(date.getFullYear(), date.getMonth(), i);
      const isSelected =
        (selected?.from && isSameDay(day, selected.from)) ||
        (selected?.to && isSameDay(day, selected.to));
      const isInRange = selected?.from && selected?.to && day > selected.from && day < selected.to;
      const isToday = isSameDay(day, today);

      days.push(
        <button
          key={i}
          onClick={() => onSelect?.({ from: day, to: selected?.to })}
          className={`h-10 w-10 rounded-full flex items-center justify-center
            ${isSelected ? 'bg-blue-600 text-white' : ''}
            ${isInRange ? 'bg-blue-100' : ''}
            ${isToday ? 'border border-blue-300' : ''}
            hover:bg-blue-100
          `}
        >
          {i}
        </button>
      );
    }

    return days;
  };

  return (
    <div className={`bg-white p-4 rounded-lg shadow-lg ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1))}
          className="p-2 hover:bg-gray-100 rounded"
        >
          &lt;
        </button>
        <div className="font-medium">
          {month.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </div>
        <button
          onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1))}
          className="p-2 hover:bg-gray-100 rounded"
        >
          &gt;
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
          <div key={day} className="text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
        {getDays(month)}
      </div>
    </div>
  );
};

// Icons (simplified versions)
const CalendarIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

const DollarSign = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <line x1="12" y1="1" x2="12" y2="23"></line>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
  </svg>
);

const CreditCard = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
    <line x1="1" y1="10" x2="23" y2="10"></line>
  </svg>
);

const TrendingUp = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
    <polyline points="17 6 23 6 23 12"></polyline>
  </svg>
);

const ArrowUp = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <line x1="12" y1="19" x2="12" y2="5"></line>
    <polyline points="5 12 12 5 19 12"></polyline>
  </svg>
);

const ArrowDown = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <polyline points="19 12 12 19 5 12"></polyline>
  </svg>
);

const AnalyticsDashboard = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const [dateRange, setDateRange] = useState({
    from: startOfMonth(new Date()),
    to: new Date(),
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDateRange, setTempDateRange] = useState({
    from: startOfMonth(new Date()),
    to: new Date(),
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      console.log('Fetching analytics data...', {
        startDate: dateRange.from?.toISOString(),
        endDate: dateRange.to?.toISOString(),
      });

      const { data } = await axios.get(`${getApiBaseUrl()}/api/analytics/transactions`, {
        params: {
          startDate: dateRange.from?.toISOString(),
          endDate: dateRange.to?.toISOString(),
        },
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });
      console.log('Analytics data received:', data);
      setAnalyticsData(data.data);
    } catch (error) {
      console.error('Error in fetchAnalyticsData:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
      }
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeSelect = () => {
    setDateRange({ ...tempDateRange });
    setShowDatePicker(false);
  };

  const handleStartDateChange = (e) => {
    const newDate = new Date(e.target.value);
    setTempDateRange((prev) => {
      const updated = { ...prev, from: newDate };
      if (newDate > prev.to) {
        updated.to = new Date(newDate);
      }
      return updated;
    });
  };

  const handleEndDateChange = (e) => {
    const newDate = new Date(e.target.value);
    setTempDateRange((prev) => ({ ...prev, to: newDate }));
  };

  useEffect(() => {
    setTempDateRange(dateRange);
  }, [dateRange]);

  const getLast30Days = () => {
    const end = new Date();
    const start = subDays(end, 30);
    setDateRange({ from: start, to: end });
  };

  const getThisMonth = () => {
    const today = new Date();
    setDateRange({
      from: startOfMonth(today),
      to: today,
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="w-full space-y-4">
        {/* Header */}
        <div className="flex flex-col">
          <h1 className="text-2xl sm:text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-500">
            Track your transaction metrics and performance
          </p>
        </div>

        {/* Date Controls */}
        <div className="flex flex-col space-y-4">
          {/* Quick Date Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={
                dateRange.from?.getTime() === startOfMonth(new Date()).getTime()
                  ? 'default'
                  : 'outline'
              }
              onClick={getThisMonth}
              size="sm"
              className="flex-1 sm:flex-none text-xs sm:text-sm"
            >
              This Month
            </Button>
            <Button
              variant={
                dateRange.from?.getTime() === subDays(new Date(), 30).getTime()
                  ? 'default'
                  : 'outline'
              }
              onClick={getLast30Days}
              size="sm"
              className="flex-1 sm:flex-none text-xs sm:text-sm"
            >
              Last 30 Days
            </Button>
          </div>

          {/* Date Range Picker */}
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
            <div className="w-full">
              <label className="block text-xs text-gray-500 mb-1">Start Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={format(dateRange.from, 'yyyy-MM-dd')}
                  onChange={(e) => {
                    const newDate = new Date(e.target.value);
                    setDateRange((prev) => ({
                      ...prev,
                      from: newDate,
                      to: newDate > prev.to ? newDate : prev.to,
                    }));
                  }}
                  max={format(dateRange.to, 'yyyy-MM-dd')}
                  className="w-full p-2 border rounded text-sm bg-white text-gray-900 border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div className="w-full">
              <label className="block text-xs text-gray-500 mb-1">End Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={format(dateRange.to, 'yyyy-MM-dd')}
                  min={format(dateRange.from, 'yyyy-MM-dd')}
                  max={format(new Date(), 'yyyy-MM-dd')}
                  onChange={(e) => {
                    const newDate = new Date(e.target.value);
                    setDateRange((prev) => ({
                      ...prev,
                      to: newDate,
                      from: newDate < prev.from ? newDate : prev.from,
                    }));
                  }}
                  className="w-full p-2 border rounded text-sm bg-white text-gray-900 border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(analyticsData?.totalAmountInINR || 0)}
            </div>
            <p className="text-xs text-gray-500">
              ${analyticsData?.totalAmountInUSD || 0} • {analyticsData?.transactionCount || 0}{' '}
              transactions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
            <CreditCard className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                analyticsData?.totalAmountInINR && analyticsData?.transactionCount
                  ? Math.round(analyticsData.totalAmountInINR / analyticsData.transactionCount)
                  : 0
              )}
            </div>
            <p className="text-xs text-gray-500">Per transaction</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Monthly Trend</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center">
              {analyticsData?.inrTrend > 0 ? (
                <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <ArrowDown className="h-4 w-4 text-red-500 mr-1" />
              )}
              {Math.abs(analyticsData?.inrTrend || 0)}%
            </div>
            <p className="text-xs text-gray-500">vs previous period</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Daily revenue over time</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={analyticsData?.dailyData || []}
                margin={{
                  top: 10,
                  right: 30,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => format(new Date(date), 'MMM dd')}
                  tick={{ fontSize: 12 }}
                />
                <YAxis tickFormatter={(value) => `₹${value}`} tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value, name) => [
                    name === 'amountInINR' ? `₹${value}` : value,
                    name === 'amountInINR' ? 'Revenue' : 'Count',
                  ]}
                  labelFormatter={(label) => `Date: ${format(new Date(label), 'PPP')}`}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="amountInINR"
                  name="Revenue"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transactions</CardTitle>
            <CardDescription>Daily transaction volume</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={analyticsData?.dailyData || []}
                margin={{
                  top: 10,
                  right: 30,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => format(new Date(date), 'MMM dd')}
                  tick={{ fontSize: 12 }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value, name) => [value, name === 'count' ? 'Transactions' : 'Amount']}
                  labelFormatter={(label) => `Date: ${format(new Date(label), 'PPP')}`}
                />
                <Legend />
                <Bar dataKey="count" name="Transactions" fill="#82ca9d" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Latest completed transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Transaction ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Customer Email
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {analyticsData?.recentTransactions?.length > 0 ? (
                  analyticsData.recentTransactions.map((transaction) => (
                    <tr key={transaction._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {format(
                          new Date(transaction.createdAt || transaction.created),
                          'MMM dd, yyyy'
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {transaction._id ? `${transaction._id.substring(0, 8)}...` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          ₹{transaction.amountInINR || 0}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          ${(transaction.amountInUSD || 0).toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            transaction.paymentStatus === 'paid'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }`}
                        >
                          {transaction.paymentStatus || 'pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {transaction.customerEmail || 'N/A'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
                    >
                      No transactions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;
