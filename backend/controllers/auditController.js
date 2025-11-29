import axios from 'axios';

// Fetch performance metrics from Google Business Profile API
export const fetchPerformanceMetrics = async (req, res) => {
  try {
    const { locationId, startDate, endDate, accessToken } = req.body;
    console.log("start date", startDate)
    console.log("end date", endDate)
    if (!locationId || !startDate || !endDate || !accessToken) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: locationId, startDate, endDate, accessToken'
      });
    }

    // Construct the API URL
    const apiUrl = `https://businessprofileperformance.googleapis.com/v1/locations/${locationId}:fetchMultiDailyMetricsTimeSeries`;
    
    // Prepare query parameters
    const params = new URLSearchParams();
    params.append('dailyMetrics', 'WEBSITE_CLICKS');
    params.append('dailyMetrics', 'CALL_CLICKS');
    
    // Add start date
    params.append('dailyRange.start_date.year', startDate.year);
    params.append('dailyRange.start_date.month', startDate.month);
    params.append('dailyRange.start_date.day', startDate.day);
    
    // Add end date
    params.append('dailyRange.end_date.year', endDate.year);
    params.append('dailyRange.end_date.month', endDate.month);
    params.append('dailyRange.end_date.day', endDate.day);
    
    const url = `${apiUrl}?${params.toString()}`;
    
    // Make the API request
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    // console.log('website click',response.data.multiDailyMetricTimeSeries)
    // Access the data
const timeSeriesArray = response.data.multiDailyMetricTimeSeries;

// Loop through each item in the array
timeSeriesArray.forEach((metricItem, index) => {
  console.log(`Metric Item ${index}:`, metricItem);
  
  // Access the dailyMetricTimeSeries array within each item
  if (metricItem.dailyMetricTimeSeries) {
    metricItem.dailyMetricTimeSeries.forEach((dailyData, dailyIndex) => {
      console.log(`Date: ${dailyData.date}, Value: ${dailyData.value}`);
    });
  }
});


    // Calculate totals
    const totals = calculateLast30DaysTotals(response.data);
    
    // Log the totals for debugging
    console.log('Performance Totals:', totals);
    
    // Log the detailed structure for debugging
    if (response.data.multiDailyMetricTimeSeries) {
      response.data.multiDailyMetricTimeSeries.forEach((metricItem, index) => {
        console.log(`Metric Item ${index}:`, JSON.stringify(metricItem, null, 2));
        
        // Access the dailyMetricTimeSeries array within each item
        if (metricItem.dailyMetricTimeSeries) {
          metricItem.dailyMetricTimeSeries.forEach((dailyMetric, dailyIndex) => {
            console.log(`Daily Metric ${dailyIndex}:`, dailyMetric.dailyMetric);
            
            // Log the structure of timeSeries for debugging
            console.log('TimeSeries structure:', typeof dailyMetric.timeSeries, Array.isArray(dailyMetric.timeSeries));
            if (dailyMetric.timeSeries) {
              console.log('TimeSeries keys:', Object.keys(dailyMetric.timeSeries));
            }
            
            // Access the timeSeries data - handle all possible structures
            if (dailyMetric.timeSeries) {
              // If timeSeries has datedValues array
              if (dailyMetric.timeSeries.datedValues && Array.isArray(dailyMetric.timeSeries.datedValues)) {
                console.log(`Time Series (datedValues format):`);
                dailyMetric.timeSeries.datedValues.forEach((timeData, timeIndex) => {
                  const value = timeData.value ? parseInt(timeData.value, 10) : 0;
                  if (timeData.date) {
                    console.log(`  Date: ${timeData.date.year}-${timeData.date.month}-${timeData.date.day}, Value: ${value}`);
                  } else {
                    console.log(`  Date: unknown, Value: ${value}`);
                  }
                });
              }
              // If timeSeries is directly an array
              else if (Array.isArray(dailyMetric.timeSeries)) {
                console.log(`Time Series (direct array format):`);
                dailyMetric.timeSeries.forEach((timeData, timeIndex) => {
                  const value = timeData.value ? parseInt(timeData.value, 10) : 0;
                  if (timeData.date) {
                    console.log(`  Date: ${timeData.date.year}-${timeData.date.month}-${timeData.date.day}, Value: ${value}`);
                  } else {
                    console.log(`  Date: unknown, Value: ${value}`);
                  }
                });
              }
              // If timeSeries is an object with a timeSeries array
              else if (dailyMetric.timeSeries.timeSeries && Array.isArray(dailyMetric.timeSeries.timeSeries)) {
                console.log(`Time Series (object format with timeSeries array):`);
                dailyMetric.timeSeries.timeSeries.forEach((timeData, timeIndex) => {
                  const value = timeData.value ? parseInt(timeData.value, 10) : 0;
                  if (timeData.date) {
                    console.log(`  Date: ${timeData.date.year}-${timeData.date.month}-${timeData.date.day}, Value: ${value}`);
                  } else {
                    console.log(`  Date: unknown, Value: ${value}`);
                  }
                });
              }
              // If timeSeries is an object but not an array
              else {
                console.log(`Time Series (object format):`, JSON.stringify(dailyMetric.timeSeries, null, 2));
              }
            }
          });
        }
      });
    }
    console.log("Performance Metrics Fetched Successfully", totals.websiteClicks, totals.callClicks)
    return res.status(200).json({
      success: true,
      data: response.data,
      totals: {
        websiteClicks: totals.websiteClicks,
        callClicks: totals.callClicks
      }
    });
  } catch (error) {
    console.error('Error fetching performance metrics:', error.response?.data || error.message);
    
    return res.status(500).json({
      success: false,
      error: error.response?.data?.error?.message || 'Failed to fetch performance metrics',
      details: error.response?.data || error.message
    });
  }
};

// Calculate totals for the last 30 days
export const calculateLast30DaysTotals = (timeSeries) => {
  if (!timeSeries || !timeSeries.multiDailyMetricTimeSeries) {
    return { websiteClicks: 0, callClicks: 0 };
  }
  
  let websiteClicks = 0;
  let callClicks = 0;
  
  // Navigate through the nested structure
  timeSeries.multiDailyMetricTimeSeries.forEach(metricItem => {
    if (metricItem.dailyMetricTimeSeries) {
      metricItem.dailyMetricTimeSeries.forEach(dailyMetric => {
        // Handle the case where timeSeries has datedValues array
        if (dailyMetric.timeSeries && dailyMetric.timeSeries.datedValues && Array.isArray(dailyMetric.timeSeries.datedValues)) {
          dailyMetric.timeSeries.datedValues.forEach(timeData => {
            // Parse value, defaulting to 0 if not present
            const value = timeData.value ? parseInt(timeData.value, 10) : 0;
            if (dailyMetric.dailyMetric === 'WEBSITE_CLICKS') {
              websiteClicks += value;
            } else if (dailyMetric.dailyMetric === 'CALL_CLICKS') {
              callClicks += value;
            }
          });
        }
        // Handle the case where timeSeries is directly an array
        else if (Array.isArray(dailyMetric.timeSeries)) {
          dailyMetric.timeSeries.forEach(timeData => {
            // Parse value, defaulting to 0 if not present
            const value = timeData.value ? parseInt(timeData.value, 10) : 0;
            if (dailyMetric.dailyMetric === 'WEBSITE_CLICKS') {
              websiteClicks += value;
            } else if (dailyMetric.dailyMetric === 'CALL_CLICKS') {
              callClicks += value;
            }
          });
        }
        // Handle the case where timeSeries.timeSeries is the array
        else if (dailyMetric.timeSeries && dailyMetric.timeSeries.timeSeries && Array.isArray(dailyMetric.timeSeries.timeSeries)) {
          dailyMetric.timeSeries.timeSeries.forEach(timeData => {
            // Parse value, defaulting to 0 if not present
            const value = timeData.value ? parseInt(timeData.value, 10) : 0;
            if (dailyMetric.dailyMetric === 'WEBSITE_CLICKS') {
              websiteClicks += value;
            } else if (dailyMetric.dailyMetric === 'CALL_CLICKS') {
              callClicks += value;
            }
          });
        }
      });
    }
  });
  
  console.log('Calculated totals - Website:', websiteClicks, 'Calls:', callClicks);
  
  return { websiteClicks, callClicks };
};