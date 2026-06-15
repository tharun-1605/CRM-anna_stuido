import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import useTimerStore from './store/timerStore';
import useAttendanceStore from './store/attendanceStore';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import AdminPanel from './pages/AdminPanel';
import LeaveRequests from './pages/LeaveRequests';
import ScreenshotViewer from './pages/ScreenshotViewer';
import Projects from './pages/Projects';
import AssignWork from './pages/AssignWork';
import WorkPackages from './pages/WorkPackages';
import PageTransition from './components/PageTransition';
import ProtectedRoute from './components/ProtectedRoute';
import GenericPlaceholder from './pages/GenericPlaceholder';
import Clients from './pages/Clients';
import Teams from './pages/Teams';
import Organizations from './pages/Organizations';
import Payroll from './pages/Payroll';
import LiveFeed from './pages/LiveFeed';
import Reports from './pages/Reports';
import Attendance from './pages/Attendance';

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<PageTransition><Dashboard /></PageTransition>} />
            <Route path="admin" element={<PageTransition><AdminPanel /></PageTransition>} />
            <Route path="leave-approval" element={<PageTransition><LeaveRequests /></PageTransition>} />
            <Route path="leave-request" element={<PageTransition><LeaveRequests /></PageTransition>} />
            <Route path="screenshots" element={<PageTransition><ScreenshotViewer /></PageTransition>} />
            <Route path="attendance" element={<PageTransition><Attendance /></PageTransition>} />
            <Route path="projects" element={<PageTransition><Projects /></PageTransition>} />
            <Route path="assign-work" element={<PageTransition><AssignWork /></PageTransition>} />
            <Route path="work-packages" element={<PageTransition><WorkPackages /></PageTransition>} />
            <Route path="work" element={<PageTransition><WorkPackages /></PageTransition>} />
            <Route path="clients" element={<PageTransition><Clients /></PageTransition>} />
            <Route path="customers" element={<PageTransition><Clients /></PageTransition>} />
            <Route path="teams" element={<PageTransition><Teams /></PageTransition>} />
            <Route path="live" element={<PageTransition><LiveFeed /></PageTransition>} />
            <Route path="reports" element={<PageTransition><Reports /></PageTransition>} />
            <Route path="invoice" element={<PageTransition><GenericPlaceholder title="Invoices" /></PageTransition>} />
            <Route path="payroll" element={<PageTransition><Payroll /></PageTransition>} />
            <Route path="integrations" element={<PageTransition><GenericPlaceholder title="Integrations" /></PageTransition>} />
            <Route path="organizations" element={<PageTransition><Organizations /></PageTransition>} />
            <Route path="settings" element={<PageTransition><GenericPlaceholder title="Settings" /></PageTransition>} />
          </Route>
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  const { isTracking } = useTimerStore();
  const { todayRecord, fetchToday } = useAttendanceStore();

  useEffect(() => {
    // Attempt to fetch today's record once on load
    fetchToday();
    
    const handleBeforeUnload = (e) => {
      let preventClose = false;

      // Rule 1: Cannot close if task screen recording is actively running
      if (isTracking) {
        preventClose = true;
      } else if (todayRecord) {
        // Rule 2: Cannot close if clocked in and actively working (not on break and not clocked out)
        const isClockedIn = !!todayRecord.clockIn;
        const isClockedOut = !!todayRecord.clockOut;
        const isOnBreak = !!(todayRecord.breaks && todayRecord.breaks.find(b => !b.endTime));

        if (isClockedIn && !isClockedOut && !isOnBreak) {
          preventClose = true;
        }
      }

      if (preventClose) {
        e.preventDefault();
        e.returnValue = ''; // Standard way to trigger browser confirmation dialog
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isTracking, todayRecord]);

  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ style: { background: '#333', color: '#fff' } }} />
      <AnimatedRoutes />
    </BrowserRouter>
  );
}

export default App;
