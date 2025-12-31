import React from "react";
import { jsPDF } from "jspdf";
import { Download, Star } from "lucide-react";
import { useGoogleBusiness } from "./context/GoogleBusinessContext";

// Custom function to draw a bar chart in the PDF
const drawBarChart = (doc, x, y, data, width, height, maxValue, monthLabels) => {
  try {
    const barWidth = 5;             // Thinner bars
    const spacing = 2;              // Less spacing between bars
    const startX = x + 20;          // Reduced left margin
    const chartBottom = y + height - 10; // Less space for labels
    
    // Draw X and Y axes
    doc.setDrawColor(220, 220, 220);
    doc.line(x + 20, y, x + 20, chartBottom); // Y-axis
    doc.line(x + 20, chartBottom, x + 20 + width, chartBottom); // X-axis
    
    // Draw Y-axis labels and grid lines
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    
    // No Y-axis labels to be shown as per user request
    
    // Use the provided month labels
    if (!monthLabels || monthLabels.length === 0) {
      monthLabels = Array(12).fill('');
    }
    
    // Calculate max bar height (leave space for labels)
    const maxBarHeight = height - 25;
    
    // Draw bars and X-axis labels
    data.forEach((item, index) => {
      if (index >= 12) return; // Safety check
      
      const barValue = Number(item.count) || 0;
      const barHeight = maxValue > 0 ? (barValue / maxValue) * maxBarHeight : 0;
      const barX = startX + (index * (barWidth + spacing));
      
      // Draw bar with gradient effect (simplified for PDF)
      if (barValue > 0) {
        // Draw the main bar
        doc.setFillColor(105, 92, 255);
        doc.rect(barX, chartBottom - barHeight, barWidth, barHeight, 'F');
        
        // Add highlight at the top of the bar
        doc.setFillColor(125, 112, 255);
        doc.rect(barX, chartBottom - barHeight, barWidth, Math.min(2, barHeight/3), 'F');
      } else {
        // Draw a small line for zero values
        doc.setFillColor(220, 220, 220);
        doc.rect(barX, chartBottom - 1, barWidth, 1, 'F');
      }
      
      // Draw count above the bar if there's a value
      const countText = barValue.toString();
      const textWidth = doc.getTextWidth(countText);
      const textX = barX + (barWidth - textWidth) / 2;
      const textY = chartBottom - barHeight - 3;
      
      // Draw background for better visibility
      doc.setFillColor(40, 40, 40, 0.8);
      doc.roundedRect(textX - 1, textY - 2, textWidth + 2, 6, 1, 1, 'F');
      
      // Draw count text
      doc.setFontSize(6);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text(countText, textX, textY + 2);
      
      // Draw month label below x-axis (every other month to prevent overlap)
      if (index % 2 === 0) {
        doc.setFontSize(6);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 100, 100);
        
        const label = monthLabels[index] || '';
        if (label) {
          const labelWidth = doc.getTextWidth(label);
          doc.text(label, barX + (barWidth - labelWidth) / 2, chartBottom + 6);
        }
      }
    });
    
    // Draw chart title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    doc.text("Monthly Review Trends", x + 20, y - 3);
    
    // Reset text style
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    
    return y + height;
  } catch (error) {
    console.error("Error drawing chart:", error);
    return y + height;
  }
};

const Report = ({ buttonText = "Download Audit Report", className = "" }) => {
  const { selectedBusiness, reviews = [], reviewStats, performanceData } = useGoogleBusiness();

  // Helper: Page Break Logic
  const safeY = (doc, y, margin = 20) => {
    const pageHeight = doc.internal.pageSize.getHeight();
    if (y > pageHeight - margin) {
      doc.addPage();
      return 25; // Reset to top
    }
    return y;
  };

  // Helper: Section Headers
  const drawSectionHeader = (doc, text, y) => {
    const w = doc.internal.pageSize.getWidth();
    y = safeY(doc, y + 10);
    
    // Header Box
    doc.setFillColor(105, 92, 255); 
    doc.roundedRect(15, y, w - 30, 10, 2, 2, "F");
    
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text(text.toUpperCase(), 20, y + 6.5);
    return y + 18;
  };

  const generate = () => {
    if (!selectedBusiness) {
      alert("Please select a business profile first!");
      return;
    }

    const doc = new jsPDF();
    const w = doc.internal.pageSize.getWidth();
    
    // --- 1. HEADER HERO SECTION ---
    doc.setFillColor(28, 27, 53); // Deep Navy
    doc.rect(0, 0, w, 50, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text(selectedBusiness.title || "Business Audit Report", 15, 22);
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(200, 200, 200);
    doc.text(`Generated Date: ${new Date().toLocaleString()}`, 15, 32);
    doc.text(`Source: Google Business Profile API`, 15, 38);
    
    let y = 60;

    // --- 2. BUSINESS PROFILE SECTION ---
    y = drawSectionHeader(doc, "Business Profile Details", y);
    doc.setTextColor(40, 40, 40);
    
    // Helper function to format business hours
    const formatHours = (hours) => {
      if (!hours || !hours.periods || !Array.isArray(hours.periods)) return "Not specified";
      
      const dayMap = {
        'MONDAY': 'Monday',
        'TUESDAY': 'Tuesday',
        'WEDNESDAY': 'Wednesday',
        'THURSDAY': 'Thursday',
        'FRIDAY': 'Friday',
        'SATURDAY': 'Saturday',
        'SUNDAY': 'Sunday',
        'DAY_OF_WEEK_UNSPECIFIED': 'Everyday',
        'MONDAY_TO_FRIDAY': 'Monday - Friday',
        'SATURDAY_SUNDAY': 'Weekends'
      };
      
      return hours.periods.map(period => {
        if (!period) return '';
        
        const openDay = period.openDay || period.open?.day || '';
        const closeDay = period.closeDay || period.close?.day || openDay;
        const openTime = period.openTime || period.open?.time || period.open || {};
        const closeTime = period.closeTime || period.close?.time || period.close || {};
        
        const formatTime = (time) => {
          if (!time) return '';
          if (typeof time === 'string') return time;
          
          const hours = time.hours || time.hour || 0;
          const minutes = time.minutes || time.minute || 0;
          const period = hours >= 12 ? 'PM' : 'AM';
          const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
          return `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`;
        };
        
        const dayRange = openDay === closeDay 
          ? dayMap[openDay] || openDay 
          : `${dayMap[openDay] || openDay} - ${dayMap[closeDay] || closeDay}`;
          
        return `${dayRange}: ${formatTime(openTime)} - ${formatTime(closeTime)}`;
      }).filter(Boolean).join('\n');
    };

    // Formatting Address
    const addrObj = selectedBusiness.location?.address || {};
    const fullAddress = addrObj.addressLines ? 
      `${addrObj.addressLines.join(", ")}, ${addrObj.locality || ''}${addrObj.regionCode ? `, ${addrObj.regionCode}` : ''} ${addrObj.postalCode || ''}`.trim()
      : "Address not available";

    // Extract location ID from name
    const getLocationId = () => {
      if (selectedBusiness.name && typeof selectedBusiness.name === 'string') {
        const parts = selectedBusiness.name.split('/');
        return parts.length > 1 ? parts[1] : selectedBusiness.name;
      }
      return 'N/A';
    };

    const locationId = getLocationId();
    
    // Business Information
    const bizInfo = [
      ["Business Name", selectedBusiness.title || "N/A"],
      ["Store Code", selectedBusiness.storeCode || "N/A"],
      ["Location ID", locationId],
      ["Account ID", selectedBusiness.accountId || "N/A"],
      ["Language", (selectedBusiness.languageCode || "").toUpperCase()],
      ["", ""], // Empty row for spacing
      ["Primary Category", 
        selectedBusiness.categories?.primaryCategory?.displayName || 
        selectedBusiness.primaryCategory?.displayName || "N/A"],
      ["Categories", 
        selectedBusiness.categories?.primaryCategory || selectedBusiness.primaryCategory 
          ? [
              ...(selectedBusiness.categories?.primaryCategory ? [selectedBusiness.categories.primaryCategory] : []),
              ...(selectedBusiness.primaryCategory ? [selectedBusiness.primaryCategory] : []),
              ...(selectedBusiness.categories?.additionalCategories || [])
            ]
              .map(c => c.displayName || c.name || c)
              .filter(Boolean)
              .join(", ")
          : "N/A"
      ],
      ["Website", selectedBusiness.websiteUri || "Not Linked"],
      ["Primary Phone", selectedBusiness.phoneNumbers?.primaryPhone || "Not Provided"],
      ["Additional Phones", selectedBusiness.phoneNumbers?.additionalPhones?.join(", ") || "None"],
      ["", ""], // Empty row for spacing
      ["Address", fullAddress],
      ["Region Code", addrObj.regionCode || "N/A"],
      ["Postal Code", addrObj.postalCode || "N/A"],
      ["Admin Area", addrObj.administrativeArea || "N/A"],
      ["Locality", addrObj.locality || "N/A"],
      ["", ""], // Empty row for spacing
      ["Business Hours", formatHours(selectedBusiness.regularHours)],
      ["Special Hours", selectedBusiness.specialHours ? "Special hours set" : "No special hours"],
      ["", ""], // Empty row for spacing
      ["Price Level", selectedBusiness.priceLevel || "Not specified"],
      ["Business Status", selectedBusiness.openInfo?.status === 'OPEN' ? 'Open' : 'Closed'],
      ["Google Attributes", selectedBusiness.attributes?.map(a => a.name || a).join(", ") || "None"],
      ["Service Area", selectedBusiness.serviceArea ? "Service area business" : "Physical location"]
    ];

    // Draw business information
    bizInfo.forEach(([label, value]) => {
      if (label === "" && value === "") {
        y += 5; // Add extra space for empty rows
        return;
      }
      
      y = safeY(doc, y, 15); // Increased vertical spacing
      
      // Draw label
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text(`${label}:`, 20, y);
      
      // Draw value with proper text wrapping
      doc.setFont("helvetica", "normal");
      const splitVal = doc.splitTextToSize(String(value || "N/A"), w - 75);
      doc.text(splitVal, 60, y);
      y += (splitVal.length * 5); // Adjust line height for wrapped text
      
      // Add a subtle separator line after sections
      if (label === "" || label === bizInfo[bizInfo.length - 1][0]) {
        y += 5;
        doc.setDrawColor(240, 240, 240);
        doc.line(20, y, w - 20, y);
        y += 5;
      }
    });

    y += 5;

    // --- 3. MONTHLY REVIEW TRENDS ---
    if (reviews && reviews.length > 0) {
      // Check if we need a new page
      y = safeY(doc, y, 100); // Make sure we have enough space for the chart
      
      y = drawSectionHeader(doc, "Monthly Review Trends (Last 12 Months)", y);
      
      // Get current date and calculate the last 12 months
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      
      // Initialize data for last 12 months
      const monthlyData = [];
      const monthLabels = [];
      const monthCounts = new Array(12).fill(0);
      
      // Generate month labels (e.g., "Jan 2023", "Feb 2023", etc.)
      for (let i = 0; i < 12; i++) {
        const month = (currentMonth - i + 12) % 12;
        const year = currentYear - Math.floor((i + (12 - currentMonth)) / 12);
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        monthLabels.unshift(`${monthNames[month]} ${year}`);
      }
      
      // Count reviews per month
      reviews.forEach(review => {
        if (review.createTime) {
          const reviewDate = new Date(review.createTime);
          const reviewYear = reviewDate.getFullYear();
          const reviewMonth = reviewDate.getMonth();
          
          // Calculate how many months ago this review was
          const monthsAgo = (currentYear - reviewYear) * 12 + (currentMonth - reviewMonth);
          
          // If review is within the last 12 months, count it
          if (monthsAgo >= 0 && monthsAgo < 12) {
            monthCounts[11 - monthsAgo]++;
          }
        }
      });
      
      // Prepare data for the chart
      const monthlyReviewData = monthCounts.map((count, index) => ({
        month: monthLabels[index],
        count: count
      }));
      
      // Calculate max value for scaling (round up to nearest 5 for clean intervals)
      const maxReviews = Math.max(...monthCounts, 1);
      const maxValue = Math.ceil(maxReviews / 5) * 5;
      
      // Set compact chart dimensions
      const chartWidth = 180;  // Reduced width for better fit
      const chartHeight = 80;  // Reduced height for compactness
      
      // Draw the chart
      y = drawBarChart(doc, 15, y, monthlyReviewData, chartWidth, chartHeight, maxValue, monthLabels);
      
      y += 10; // Add some space after the chart
    }
    
    // --- 4. KPI / PERFORMANCE CARDS ---
    y = drawSectionHeader(doc, "Key Performance Indicators (KPIs)", y);
    
    const kpis = [
      { label: "Avg Rating", val: reviewStats?.averageRating || "0.0", color: [79, 70, 229] },
      { label: "Total Reviews", val: reviews.length || "0", color: [5, 150, 105] },
      { label: "Local Clicks", val: performanceData?.websiteClicks || "0", color: [37, 99, 235] }
    ];

    kpis.forEach((item, i) => {
      const x = 15 + (i * 63);
      doc.setFillColor(item.color[0], item.color[1], item.color[2]);
      doc.roundedRect(x, y, 58, 25, 2, 2, "F");
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.text(item.label, x + 5, y + 8);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(String(item.val), x + 5, y + 18);
    });

    y += 35;

    // --- 4. RATING DISTRIBUTION ---
    if (reviews && reviews.length > 0) {
      y = drawSectionHeader(doc, "Rating Quality Analysis", y);
      
      // Calculate rating distribution
      const ratingMap = { 'FIVE': 5, 'FOUR': 4, 'THREE': 3, 'TWO': 2, 'ONE': 1 };
      const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      
      reviews.forEach(review => {
        const rating = ratingMap[review.starRating] || 0;
        if (rating >= 1 && rating <= 5) {
          ratingDistribution[rating]++;
        }
      });
      
      const totalRatings = reviews.length || 1; // Avoid division by zero
      const maxCount = Math.max(...Object.values(ratingDistribution), 1);
      
      // Draw rating bars
      [5, 4, 3, 2, 1].forEach((rating, index) => {
        const count = ratingDistribution[rating];
        const percentage = Math.round((count / totalRatings) * 100) || 0;
        const barWidth = (count / maxCount) * 100; // Scale to 100% of available width
        
        // Position and dimensions
        const startX = 20;
        const startY = y + (index * 12);
        const barHeight = 8;
        const barMaxWidth = w - 100; // Leave space for labels
        
        // Draw star rating
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(60, 60, 60);
        doc.text(`${rating}★`, startX, startY + 5);
        
        // Draw bar background
        doc.setFillColor(230, 230, 230);
        doc.rect(startX + 30, startY, barMaxWidth, barHeight, 'F');
        
        // Draw filled bar with gradient effect
        const fillColor = 
          rating === 5 ? [76, 175, 80] :  // Green for 5 stars
          rating === 4 ? [139, 195, 74] : // Light green for 4 stars
          rating === 3 ? [255, 193, 7] :  // Yellow for 3 stars
          rating === 2 ? [255, 152, 0] :  // Orange for 2 stars
          [244, 67, 54];                  // Red for 1 star
        
        doc.setFillColor(fillColor[0], fillColor[1], fillColor[2]);
        doc.rect(startX + 30, startY, (barWidth / 100) * barMaxWidth, barHeight, 'F');
        
        // Add highlight at the top of the bar
        doc.setFillColor(
          Math.min(255, fillColor[0] + 30),
          Math.min(255, fillColor[1] + 30),
          Math.min(255, fillColor[2] + 30)
        );
        doc.rect(startX + 30, startY, (barWidth / 100) * barMaxWidth, 2, 'F');
        
        // Draw percentage and count
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 100, 100);
        doc.text(`${percentage}% (${count})`, startX + 40 + barMaxWidth, startY + 5);
      });
      
      y += 70; // Adjust spacing after the chart
    }

    // --- 5. REVIEWS & RESPONSES ---
    y = drawSectionHeader(doc, "Customer Reviews & Business Responses", y);

    const ratingMap = { 'FIVE': 5, 'FOUR': 4, 'THREE': 3, 'TWO': 2, 'ONE': 1 };
    
    reviews.forEach((rev, index) => {
      y = safeY(doc, y, 50); // High margin for review blocks

      // Reviewer Name & Date
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(30, 30, 30);
      doc.text(rev.reviewer?.displayName || "Anonymous Customer", 20, y);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      const dateStr = rev.createTime ? new Date(rev.createTime).toLocaleDateString() : "";
      doc.text(dateStr, w - 45, y);

      y += 6;
      
      // Stars
      const stars = ratingMap[rev.starRating] || 0;
      doc.setTextColor(255, 170, 0);
      doc.setFontSize(12);
      doc.text("★".repeat(stars) + "☆".repeat(5 - stars), 20, y);

      y += 6;

      // Comment
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      doc.setFont("helvetica", "normal");
      const commentText = rev.comment || "No text review provided.";
      const splitComment = doc.splitTextToSize(commentText, w - 40);
      doc.text(splitComment, 20, y);
      
      y += (splitComment.length * 5) + 4;

      // Response Box
      if (rev.reviewReply) {
        doc.setFillColor(248, 247, 255);
        const replyText = `Business Response: ${rev.reviewReply.comment}`;
        const splitReply = doc.splitTextToSize(replyText, w - 50);
        
        doc.roundedRect(22, y, w - 44, (splitReply.length * 5) + 8, 2, 2, "F");
        doc.setTextColor(105, 92, 255);
        doc.setFont("helvetica", "italic");
        doc.text(splitReply, 26, y + 6);
        
        y += (splitReply.length * 5) + 12;
      }

      // Separator Line
      doc.setDrawColor(240, 240, 240);
      doc.line(15, y, w - 15, y);
      y += 10;
    });

    // --- FOOTER (Page Numbers) ---
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(180, 180, 180);
      doc.text(`Clurst Business Intelligence - Page ${i} of ${totalPages}`, w / 2, 288, { align: "center" });
    }

    const fileName = selectedBusiness.title 
      ? `${selectedBusiness.title.replace(/\s+/g, '_')}_Report.pdf` 
      : "Business_Report.pdf";
      
    doc.save(fileName);
  };

  return (
    <button
      onClick={generate}
      className={`flex items-center justify-center gap-2 font-semibold transition-all duration-200 ${className}`}
    >
      <Download size={18} />
      <span>{buttonText}</span>
    </button>
  );
};

export default Report;