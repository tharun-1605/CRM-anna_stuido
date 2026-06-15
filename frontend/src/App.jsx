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
import Integrations from './pages/Integrations';

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <Routes location={location}>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="admin" element={<AdminPanel />} />
          <Route path="leave-approval" element={<LeaveRequests />} />
          <Route path="leave-request" element={<LeaveRequests />} />
          <Route path="screenshots" element={<ScreenshotViewer />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="projects" element={<Projects />} />
          <Route path="assign-work" element={<AssignWork />} />
          <Route path="work-packages" element={<WorkPackages />} />
          <Route path="work" element={<WorkPackages />} />
          <Route path="clients" element={<Clients />} />
          <Route path="customers" element={<Clients />} />
          <Route path="teams" element={<Teams />} />
          <Route path="live" element={<LiveFeed />} />
          <Route path="reports" element={<Reports />} />
          <Route path="invoice" element={<GenericPlaceholder title="Invoices" />} />
          <Route path="payroll" element={<Payroll />} />
          <Route path="integrations" element={<Integrations />} />
          <Route path="organizations" element={<Organizations />} />
          <Route path="settings" element={<GenericPlaceholder title="Settings" />} />
        </Route>
      </Route>
    </Routes>
  );
}

function App() {
  const isTracking = useTimerStore((state) => state.isTracking);
  const todayRecord = useAttendanceStore((state) => state.todayRecord);
  const fetchToday = useAttendanceStore((state) => state.fetchToday);

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
