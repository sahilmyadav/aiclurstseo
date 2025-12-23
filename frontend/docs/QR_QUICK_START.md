# QR Review System - Quick Start Guide

## 🚀 Quick Setup (5 Minutes)

### 1. Install Package
```bash
cd aifrontent
npm install qrcode
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Connect Google Business
```
http://localhost:5173/dashboard/integrations
→ Click "Connect Google Business"
→ Authorize with Google
```

### 4. Generate QR Code
```
http://localhost:5173/dashboard/reviews
→ Click "QR CODE" tab
→ Select business (if multiple)
→ Download QR code
```

### 5. Test Review Flow
```
Scan QR code with phone OR
Open review link in browser
→ Select star rating
→ Test both flows (1-3 stars & 4-5 stars)
```

---

## 📱 User Flow

### For Business Owner

1. **Login** → Dashboard
2. **Integrations** → Connect Google
3. **Get Reviews** → QR CODE tab
4. **Generate** → Download QR
5. **Print** → Display at location

### For Customer

1. **Scan** → QR code at business
2. **Rate** → Select 1-5 stars
3. **Low Rating (1-3)**:
   - Fill feedback form
   - Submit concerns
4. **High Rating (4-5)**:
   - Click "Review on Google"
   - Write public review

---

## 🎯 Key Features

✅ **Auto-select** single business  
✅ **Dropdown** for multiple businesses  
✅ **Dynamic QR** generation  
✅ **Download** as PNG  
✅ **Copy** review link  
✅ **Smart routing** based on rating  
✅ **Feedback form** for low ratings  
✅ **Google redirect** for high ratings  

---

## 🔧 File Changes Made

### New Files
- `src/components/QRCodeComponent.jsx` (Updated)
- `src/pages/MakeReview.jsx` (New)
- `docs/QR_REVIEW_SYSTEM.md` (New)
- `docs/QR_QUICK_START.md` (New)

### Modified Files
- `src/App.jsx` (Added route)
- `src/index.css` (Added animation)
- `package.json` (Added qrcode)

---

## 🧪 Testing Checklist

### QR Component
- [ ] Business dropdown appears (if multiple)
- [ ] QR code generates automatically
- [ ] Download button works
- [ ] Copy link works
- [ ] Open link works

### Review Page
- [ ] Page loads without errors
- [ ] Business name displays correctly
- [ ] Stars are clickable
- [ ] Hover effect works
- [ ] 1-3 stars shows form
- [ ] 4-5 stars shows Google button
- [ ] Form validation works
- [ ] Feedback submits successfully
- [ ] Google button redirects correctly
- [ ] Success message appears

---

## 🐛 Common Issues

### "qrcode is not defined"
```bash
npm install qrcode
npm run dev  # Restart server
```

### "Cannot read properties of undefined"
```
Check Google Business is connected
Verify businesses array has data
```

### "QR code not scanning"
```
Ensure QR code is high resolution
Test with different QR scanner apps
Verify review URL is accessible
```

### "Review page shows 404"
```
Check App.jsx has route configured
Verify path is /review/:locationId
Restart development server
```

---

## 📝 Quick Reference

### Generate QR URL Format
```javascript
/review/:locationId?name=BusinessName
```

### Check Connection Status
```javascript
const { isConnected } = useGoogleBusiness();
```

### Get Businesses
```javascript
const { businesses } = useGoogleBusiness();
```

### Select Business
```javascript
const { selectBusiness } = useGoogleBusiness();
selectBusiness(businessObject);
```

---

## 🎨 Customize

### Change QR Size
```javascript
// QRCodeComponent.jsx line 29
width: 400,  // Change from 300
```

### Change Star Count
```javascript
// MakeReview.jsx line 133
{[1, 2, 3, 4, 5, 6].map((star) => ...  // Add 6th star
```

### Change Rating Threshold
```javascript
// MakeReview.jsx line 23
if (rating >= 1 && rating <= 2) {  // Change from 3
```

---

## 🔗 Important URLs

**Development**:
- Dashboard: `http://localhost:5173/dashboard`
- Integrations: `http://localhost:5173/dashboard/integrations`
- QR Generator: `http://localhost:5173/dashboard/reviews`
- Review Page: `http://localhost:5173/review/:id`

**Production**:
- Update URLs in `QRCodeComponent.jsx` line 25:
```javascript
const reviewUrl = `https://yourdomain.com/review/${locationId}...`;
```

---

## 📦 Dependencies

**Required**:
- `qrcode` - QR code generation
- `react-router-dom` - Routing
- `react` - Core

**Context**:
- `GoogleBusinessContext` - Business data

---

## ✨ Next Steps

1. **Test thoroughly** on different devices
2. **Add backend** for feedback storage
3. **Set up analytics** to track scans
4. **Print QR codes** for physical locations
5. **Train staff** on the system
6. **Monitor reviews** and feedback

---

## 💡 Pro Tips

1. **Print large QR codes** (min 2x2 inches)
2. **Place prominently** near checkout/exit
3. **Add call-to-action** "Scan to rate us!"
4. **Test before printing** multiple copies
5. **Monitor feedback** regularly
6. **Respond promptly** to low ratings
7. **Thank customers** for high ratings

---

## 📧 Support

**Check logs**:
```bash
# Browser console
F12 → Console

# Terminal
npm run dev
```

**Debug mode**:
```javascript
console.log('Business:', selectedBusiness);
console.log('QR URL:', reviewLink);
console.log('Connected:', isConnected);
```

**Need help?**
1. Check browser console for errors
2. Verify all files are saved
3. Restart development server
4. Clear browser cache
5. Test in incognito mode

---

## 🎉 Success Indicators

✅ QR code displays correctly  
✅ Download saves PNG file  
✅ Review link opens in browser  
✅ Star rating works smoothly  
✅ Form appears for low ratings  
✅ Google button appears for high ratings  
✅ Feedback submits successfully  
✅ Success message shows after submission  

---

**You're all set! 🚀**

Scan your first QR code and start collecting reviews!
