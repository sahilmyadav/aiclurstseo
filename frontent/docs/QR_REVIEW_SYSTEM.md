# QR Code Review System Documentation

## Overview
Complete QR code system integrated with Google Business that generates scannable QR codes for businesses. When scanned, customers can rate their experience, and based on the rating, they either submit feedback or are redirected to leave a Google review.

---

## Features

### 🎯 **Smart Business Selection**
- **Single Business**: Automatically selected by default
- **Multiple Businesses**: Dropdown menu to choose which business to generate QR for

### 📱 **QR Code Generation**
- Generates unique QR codes for each selected business
- QR code contains review link with business information
- Download QR code as PNG image
- Copy review link to clipboard
- Open review link directly in browser

### ⭐ **Smart Review Flow**
When QR is scanned, customer goes through a rating-based flow:

1. **Star Rating Selection (1-5 stars)**
   - Visual star rating interface
   - Hover effects for better UX

2. **1-3 Stars (Low Rating)**
   - Shows feedback form
   - Collects: Name, Email, Feedback text
   - Submits feedback to backend for improvement

3. **4-5 Stars (High Rating)**
   - Shows "Review on Google Profile" button
   - Redirects to Google review page
   - Helps boost public Google ratings

---

## File Structure

```
aifrontent/
├── src/
│   ├── components/
│   │   ├── QRCodeComponent.jsx          # QR code generator
│   │   └── context/
│   │       └── GoogleBusinessContext.jsx # Business data provider
│   ├── pages/
│   │   └── MakeReview.jsx               # Public review page
│   ├── App.jsx                          # Routes configuration
│   └── index.css                        # Animations
└── package.json                         # Dependencies
```

---

## Components

### 1. QRCodeComponent.jsx

**Location**: `src/components/QRCodeComponent.jsx`

**Features**:
- Fetches businesses from Google Business Context
- Shows business dropdown (if multiple)
- Generates QR code dynamically
- Provides download and copy functionality

**Usage**:
```jsx
import QRCodeComponent from './components/QRCodeComponent';

// Inside dashboard
<QRCodeComponent />
```

**State Management**:
```javascript
const { 
  businesses,        // Array of Google businesses
  selectedBusiness,  // Currently selected business
  selectBusiness,    // Function to select business
  isConnected,       // Google connection status
  loading            // Loading state
} = useGoogleBusiness();
```

---

### 2. MakeReview.jsx

**Location**: `src/pages/MakeReview.jsx`

**Features**:
- Public page (no authentication required)
- Star rating interface (1-5 stars)
- Conditional form display based on rating
- Feedback submission for low ratings
- Google redirect for high ratings

**URL Format**:
```
/review/:locationId?name=BusinessName
```

**Example**:
```
http://localhost:5173/review/ChIJN1t_tDeuEmsRUsoyG83frY4?name=My%20Coffee%20Shop
```

---

## Installation & Setup

### 1. Install Dependencies

```bash
cd aifrontent
npm install qrcode
```

### 2. Verify Package.json

Ensure `qrcode` is in dependencies:
```json
{
  "dependencies": {
    "qrcode": "^1.5.4"
  }
}
```

### 3. Routes Setup

Routes are already configured in `App.jsx`:
```jsx
<Route path="/review/:locationId" element={<MakeReview />} />
```

---

## Usage Flow

### Step 1: Connect Google Business
```
Dashboard → Integrations → Connect Google Business
```

### Step 2: Generate QR Code
```
Dashboard → Get Reviews → QR CODE Tab
```

### Step 3: Select Business (if multiple)
- Single business: Auto-selected
- Multiple businesses: Choose from dropdown

### Step 4: Download/Share QR Code
- **Download**: Saves as PNG image
- **Copy Link**: Copies review URL
- **Open Link**: Preview in browser

### Step 5: Customer Scans QR
- Opens review page `/review/:locationId`
- Customer selects star rating

### Step 6: Smart Flow
**Low Rating (1-3 stars)**:
```
Select Stars → Form Appears → Fill Details → Submit Feedback
```

**High Rating (4-5 stars)**:
```
Select Stars → Google Button Appears → Click → Redirect to Google
```

---

## API Integration

### Google Business Context

The QR component uses `GoogleBusinessContext` to:
- Check if Google is connected
- Fetch list of businesses
- Get selected business details

**Context Methods**:
```javascript
const {
  businesses,         // Array of businesses
  selectedBusiness,   // Current selection
  selectBusiness,     // Select function
  isConnected,        // Connection status
  loading            // Loading state
} = useGoogleBusiness();
```

### Business Data Structure

```javascript
{
  name: "accounts/123/locations/456",
  title: "My Business Name",
  accountId: "123",
  metadata: {
    address: { formattedAddress: "123 Main St" }
  },
  phoneNumbers: [{ number: "+1234567890" }]
}
```

---

## QR Code Generation

### Technology
Uses `qrcode` npm package for QR generation

### Configuration
```javascript
await QRCode.toDataURL(reviewUrl, {
  width: 300,      // QR code width
  margin: 2,       // Margin around QR
  color: {
    dark: '#000000',   // QR code color
    light: '#FFFFFF'   // Background color
  }
});
```

### Review URL Format
```javascript
const reviewUrl = `${window.location.origin}/review/${locationId}?name=${encodeURIComponent(businessName)}`;
```

**Example**:
```
http://localhost:5173/review/ChIJ123?name=Coffee%20Shop
```

---

## Review Page Logic

### Star Rating Logic

```javascript
if (rating >= 1 && rating <= 3) {
  // Show feedback form
  showForm = true;
  showGoogleButton = false;
}

if (rating >= 4 && rating <= 5) {
  // Show Google review button
  showForm = false;
  showGoogleButton = true;
}
```

### Feedback Form (Low Ratings)

**Fields**:
- Name (text, required)
- Email (email, required)
- Feedback (textarea, required)

**Submission**:
```javascript
// Submit to backend
console.log({
  locationId,
  businessName,
  rating: selectedRating,
  name,
  email,
  feedback
});

// Show success message
setSubmitted(true);
```

### Google Review (High Ratings)

**Redirect URL**:
```javascript
const googleReviewUrl = `https://search.google.com/local/writereview?placeid=${locationId}`;
window.open(googleReviewUrl, '_blank');
```

---

## Styling

### Design System
- **Background**: Gradient purple/black
- **Cards**: Glass morphism effect
- **Colors**: Purple, Blue, Green accents
- **Font**: Modern, sans-serif

### Responsive Design
- Mobile-first approach
- Breakpoints: `sm:`, `md:`, `lg:`
- Touch-friendly star ratings

### Animations
```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

---

## Error Handling

### Not Connected
```jsx
if (!isConnected) {
  return <ConnectGoogleMessage />;
}
```

### No Businesses
```jsx
if (businesses.length === 0) {
  return <LoadingMessage />;
}
```

### QR Generation Error
```javascript
try {
  const qrDataUrl = await QRCode.toDataURL(reviewUrl);
  setQrCodeUrl(qrDataUrl);
} catch (err) {
  console.error('Error generating QR code:', err);
}
```

---

## Testing

### Test QR Code Generation
1. Connect Google Business account
2. Navigate to Get Reviews → QR CODE tab
3. Verify QR code appears
4. Download QR code and scan with phone
5. Verify review page opens correctly

### Test Rating Flow

**Low Rating (1-3 stars)**:
1. Scan QR code or open review link
2. Click 1-3 stars
3. Verify form appears
4. Fill out form
5. Submit and verify success message

**High Rating (4-5 stars)**:
1. Scan QR code or open review link
2. Click 4-5 stars
3. Verify Google button appears
4. Click button
5. Verify Google review page opens

---

## Backend Integration (TODO)

### Feedback Submission Endpoint

**POST** `/api/reviews/feedback`

**Request**:
```json
{
  "locationId": "ChIJ123",
  "businessName": "My Business",
  "rating": 2,
  "name": "John Doe",
  "email": "john@example.com",
  "feedback": "Service was slow"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Feedback submitted successfully"
}
```

---

## Customization

### Change QR Code Colors
```javascript
// In QRCodeComponent.jsx
await QRCode.toDataURL(reviewUrl, {
  color: {
    dark: '#6B21A8',   // Purple QR code
    light: '#FFFFFF'   // White background
  }
});
```

### Change Rating Threshold
```javascript
// In MakeReview.jsx
if (rating >= 1 && rating <= 2) {  // Changed from 3 to 2
  // Show form
}
```

### Add Custom Branding
```jsx
// Add logo to review page
<div className="mb-4">
  <img src="/logo.png" alt="Logo" className="w-20 h-20 mx-auto" />
</div>
```

---

## Troubleshooting

### QR Code Not Generating
**Issue**: QR code shows "Generating QR..."

**Solutions**:
1. Check if business is selected
2. Verify `qrcode` package is installed
3. Check browser console for errors
4. Ensure `selectedBusiness` has valid data

### Review Page Not Opening
**Issue**: QR scan doesn't open page

**Solutions**:
1. Verify URL format is correct
2. Check if route is configured in App.jsx
3. Test URL manually in browser
4. Ensure frontend server is running

### Google Review Not Opening
**Issue**: Google review button doesn't work

**Solutions**:
1. Verify `locationId` is valid Google Place ID
2. Check if popup is blocked by browser
3. Test with `_blank` target for new tab
4. Use actual Google Place ID, not location name

---

## Future Enhancements

### Phase 1
- [ ] Backend API for feedback storage
- [ ] Email notifications for low ratings
- [ ] Analytics dashboard for review stats

### Phase 2
- [ ] Custom QR code styling (colors, logos)
- [ ] QR code templates
- [ ] Batch QR generation for multiple businesses

### Phase 3
- [ ] SMS integration for review requests
- [ ] WhatsApp review sharing
- [ ] Review response management

---

## Support

For issues or questions:
1. Check console for errors
2. Verify all dependencies installed
3. Ensure Google Business is connected
4. Test with sample business data
