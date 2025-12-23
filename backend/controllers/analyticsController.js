// @desc    Get transaction analytics
import Payment from '../models/Payment.js';
import { subDays, differenceInDays, eachDayOfInterval, format, startOfMonth } from 'date-fns';

// @route   GET /api/analytics/transactions
// @access  Private/Admin
export const getTransactionAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    console.log(startDate, endDate, "Date range received");
    
    // Parse dates or use defaults
    const start = startDate ? new Date(startDate) : startOfMonth(new Date());
    const end = endDate ? new Date(endDate) : new Date();
    
    console.log('Processing date range:', { start, end });

    // Get current period data with both USD and INR amounts
    const [currentPeriodData] = await Payment.aggregate([
      {
        $match: {
          paymentStatus: 'paid',
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: null,
          totalAmountInCents: { $sum: '$amountInCents' },
          totalAmountInINR: { $sum: '$amountInINR' },
          transactionCount: { $sum: 1 }
        }
      }
    ]);

    // Calculate previous period dates
    const prevStart = subDays(start, differenceInDays(end, start) + 1);
    const prevEnd = subDays(start, 1);

    // Get previous period data with both USD and INR amounts
    const [previousPeriodData] = await Payment.aggregate([
      {
        $match: {
          paymentStatus: 'paid',
          createdAt: { $gte: prevStart, $lte: prevEnd }
        }
      },
      {
        $group: {
          _id: null,
          totalAmountInCents: { $sum: '$amountInCents' },
          totalAmountInINR: { $sum: '$amountInINR' },
          transactionCount: { $sum: 1 }
        }
      }
    ]);

    // Get daily data for charts with both currencies
    const dailyData = await Payment.aggregate([
      {
        $match: {
          paymentStatus: 'paid',
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          amountInCents: { $sum: '$amountInCents' },
          amountInINR: { $sum: '$amountInINR' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Format daily data for charts
    const formattedDailyData = eachDayOfInterval({ start, end }).map(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const dayData = dailyData.find(d => d._id === dateStr);
      return {
        date: day.toISOString(),
        amountInCents: dayData?.amountInCents || 0,
        amountInINR: dayData?.amountInINR || 0,
        count: dayData?.count || 0
      };
    });

    // Get recent transactions
    const recentTransactions = await Payment.find({
      paymentStatus: 'paid',
      createdAt: { $gte: start, $lte: end }
    })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

    // Calculate trends
    const currentTotalInCents = currentPeriodData?.totalAmountInCents || 0;
    const previousTotalInCents = previousPeriodData?.totalAmountInCents || 0;
    const currentTotalInINR = currentPeriodData?.totalAmountInINR || 0;
    const previousTotalInINR = previousPeriodData?.totalAmountInINR || 0;

    const usdTrend = previousTotalInCents > 0 
      ? Math.round(((currentTotalInCents - previousTotalInCents) / previousTotalInCents) * 100)
      : 100;

    const inrTrend = previousTotalInINR > 0
      ? Math.round(((currentTotalInINR - previousTotalInINR) / previousTotalInINR) * 100)
      : 100;

    res.json({
      success: true,
      data: {
        // Current period totals
         totalAmountInUSD: (currentTotalInCents / 100).toFixed(2), // Add this line
        totalAmountInCents: currentTotalInCents,
        totalAmountInINR: currentTotalInINR,
        transactionCount: currentPeriodData?.transactionCount || 0,
        
        // Trends
        usdTrend,
        inrTrend,
        
        // Daily data
        dailyData: formattedDailyData,
        
        // Recent transactions
        recentTransactions
      }
    });
  } catch (error) {
    console.error('Error in getTransactionAnalytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics data',
      error: error.message
    });
  }
};