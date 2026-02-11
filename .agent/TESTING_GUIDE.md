# Admin Dashboard - Quick Testing Guide

## 🧪 How to Test All Features

### **Step 1: Login**
1. Navigate to `http://localhost:3000/login`
2. Use credentials:
   - Email: `admin@hospital.com`
   - Password: `admin123`
3. ✅ Should redirect to `/admin/dashboard`

---

### **Step 2: Test Navigation**
Click each sidebar menu item and verify it loads:
- ✅ **Dashboard** - Shows overview with charts
- ✅ **Patients** - Shows patient table
- ✅ **Appointments** - Shows today's appointments
- ✅ **Staff & Doctors** - Shows doctor cards
- ✅ **Pharmacy & Lab** - Shows medicine inventory
- ✅ **Billing** - Shows transactions

---

### **Step 3: Test Search**
1. Click in the search bar at the top
2. Type a patient name, doctor name, or medicine
3. ✅ Dropdown should appear with results
4. ✅ Click a result to navigate to that section
5. ✅ Press Escape to close dropdown

---

### **Step 4: Test Notifications**
1. Click the bell icon (🔔)
2. ✅ Dropdown shows 4 notifications
3. ✅ Unread count badge shows "2 new"
4. ✅ Click outside to close
5. ✅ Press Escape to close

---

### **Step 5: Test User Menu**
1. Click on "Admin Sarah Jenkins" profile
2. ✅ Dropdown shows menu options
3. ✅ Click "Logout" to test logout
4. ✅ Should redirect to login page

---

### **Step 6: Test Modals**

#### Add Patient Modal:
1. Go to Dashboard
2. Click "NEW ADMISSION" button
3. ✅ Modal opens
4. Fill in patient details
5. ✅ Submit creates new patient

#### Add Appointment Modal:
1. Go to Appointments section
2. Click "Schedule Appointment" button
3. ✅ Modal opens
4. Fill in appointment details
5. ✅ Submit creates new appointment

#### Add Medicine Modal:
1. Go to Pharmacy section
2. Click "Add Medicine" button
3. ✅ Modal opens
4. Fill in medicine details
5. ✅ Submit creates new medicine

---

### **Step 7: Test Data Tables**
1. Go to Patients section
2. ✅ Table shows patient data
3. ✅ Search box filters results
4. ✅ Click column headers to sort
5. ✅ Pagination works (if >10 patients)

---

### **Step 8: Test Responsive Design**
1. Resize browser window to mobile size
2. ✅ Sidebar collapses
3. ✅ Hamburger menu appears
4. ✅ Click to toggle sidebar
5. ✅ All sections remain functional

---

### **Step 9: Test Interactive Elements**

#### Dashboard:
- ✅ Hover over department occupancy bars (shows tooltip)
- ✅ Click "Order Now" on low stock alerts
- ✅ Click approve/reject on staff requests

#### Appointments:
- ✅ View appointment status badges
- ✅ Click action buttons on appointments

#### Staff:
- ✅ Click "View Profile" on doctor cards
- ✅ Click "Schedule" on doctor cards

#### Pharmacy:
- ✅ Click "Reorder" on low stock medicines
- ✅ View stock status indicators

#### Billing:
- ✅ View payment status (Paid/Pending)
- ✅ Click action buttons on transactions

---

## 🎯 **Expected Behavior**

### ✅ **All Features Should:**
- Load without errors
- Show real data from backend
- Have smooth animations
- Respond to clicks/hovers
- Display proper loading states
- Show toast notifications on actions
- Navigate correctly between sections
- Close dropdowns on click-outside
- Support keyboard (Escape key)

### ❌ **Common Issues & Solutions:**

**Issue:** 429 Rate Limit Error
- **Solution:** Wait 15 minutes OR restart backend server

**Issue:** No data showing
- **Solution:** Check backend is running on port 5000

**Issue:** Modal doesn't open
- **Solution:** Check console for errors, verify modal imports

**Issue:** Search not working
- **Solution:** Ensure data is loaded (check loading state)

---

## 📋 **Pre-Flight Checklist**

Before moving to next chapter, verify:
- [ ] Backend server running (`npm run dev` in backend folder)
- [ ] Frontend server running (`npm run dev` in root folder)
- [ ] Can login successfully
- [ ] All 6 sections load
- [ ] Search works
- [ ] Notifications work
- [ ] User menu works
- [ ] All 3 modals open
- [ ] Data tables display
- [ ] No console errors
- [ ] Logout works

---

## 🚀 **You're Ready!**

If all items above work, your Admin Dashboard is **100% functional** and you can confidently move to the next chapter!

**Next Steps:**
- Doctor Dashboard
- Patient Portal
- Receptionist Interface
- Pharmacist Module
- Lab Technician Module
