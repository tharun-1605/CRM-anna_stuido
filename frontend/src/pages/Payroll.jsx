import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { DollarSign, FileText, Download, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Payroll() {
  const [payrolls, setPayrolls] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);

  // We'll use current month/year for simplicity
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const fetchPayrolls = async () => {
    try {
      const { data } = await axios.get(`/payrolls?month=${currentMonth}&year=${currentYear}`);
      setPayrolls(data);
    } catch (error) {
      toast.error('Failed to load payrolls');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrolls();
  }, []);

  const handleRunPayroll = async () => {
    if (!window.confirm(`Run payroll for ${getMonthName(currentMonth)} ${currentYear}?`)) return;
    setIsRunning(true);
    try {
      await axios.post('/payrolls/run', { month: currentMonth, year: currentYear });
      toast.success('Payroll calculated successfully');
      fetchPayrolls();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to run payroll');
    } finally {
      setIsRunning(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.put(`/payrolls/${id}/status`, { status: newStatus });
      toast.success('Status updated');
      fetchPayrolls();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const getMonthName = (monthNum) => {
    const date = new Date();
    date.setMonth(monthNum - 1);
    return date.toLocaleString('default', { month: 'long' });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Paid':
        return <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700"><CheckCircle className="w-3 h-3 mr-1" /> Paid</span>;
      case 'Pending':
        return <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-700"><Clock className="w-3 h-3 mr-1" /> Pending</span>;
      default:
        return <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  // Calculate summary stats
  const totalProcessed = payrolls.filter(p => p.status === 'Paid').reduce((sum, p) => sum + p.netPay, 0);
  const pendingCount = payrolls.filter(p => p.status === 'Pending').length;
  const payslipsGenerated = payrolls.length;

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Payroll Processing</h1>
          <p className="text-sm text-gray-500 mt-1">Manage employee salaries and view payment history</p>
        </div>
        <div className="flex space-x-3">
           <button className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center shadow-sm">
             <FileText className="w-4 h-4 mr-2" />
             Export Report
           </button>
           <button 
             onClick={handleRunPayroll}
             disabled={isRunning}
             className="app-btn-primary flex items-center px-4 py-2 disabled:opacity-50"
           >
             <DollarSign className="w-4 h-4 mr-2" />
             {isRunning ? 'Running...' : 'Run Payroll'}
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex items-center">
           <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center mr-4">
              <DollarSign className="w-6 h-6 text-teal-600" />
           </div>
           <div>
             <p className="text-sm text-gray-500 font-medium">Total Paid ({getMonthName(currentMonth)})</p>
             <h3 className="text-2xl font-bold text-gray-800">${totalProcessed.toLocaleString()}</h3>
           </div>
        </div>
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex items-center">
           <div className="w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center mr-4">
              <Clock className="w-6 h-6 text-yellow-600" />
           </div>
           <div>
             <p className="text-sm text-gray-500 font-medium">Pending Payments</p>
             <h3 className="text-2xl font-bold text-gray-800">{pendingCount}</h3>
           </div>
        </div>
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex items-center">
           <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mr-4">
              <FileText className="w-6 h-6 text-blue-600" />
           </div>
           <div>
             <p className="text-sm text-gray-500 font-medium">Payslips Generated</p>
             <h3 className="text-2xl font-bold text-gray-800">{payslipsGenerated}</h3>
           </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm flex-1 overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-gray-50 z-10">
              <tr className="border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                <th className="px-6 py-4 font-medium">Employee</th>
                <th className="px-6 py-4 font-medium">Period</th>
                <th className="px-6 py-4 font-medium">Basic Salary</th>
                <th className="px-6 py-4 font-medium">Net Pay</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-500 mr-2"></div>
                      Loading payroll data...
                    </div>
                  </td>
                </tr>
              ) : payrolls.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No payroll records found for this month.</p>
                    <p className="text-gray-400 text-xs mt-1">Click "Run Payroll" to generate payslips based on tracked time.</p>
                  </td>
                </tr>
              ) : (
                payrolls.map((payroll) => (
                  <tr key={payroll._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-800">{payroll.user?.name || 'Unknown'}</div>
                      <div className="text-xs text-gray-500">{payroll.user?.email || ''}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{getMonthName(payroll.month)} {payroll.year}</td>
                    <td className="px-6 py-4 text-gray-600">${payroll.basicSalary.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                    <td className="px-6 py-4 font-medium text-gray-800">${payroll.netPay.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                    <td className="px-6 py-4 cursor-pointer" onClick={() => handleStatusChange(payroll._id, payroll.status === 'Paid' ? 'Pending' : 'Paid')} title="Click to toggle status">
                      {getStatusBadge(payroll.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end space-x-2">
                        <button className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded transition-colors" title="Download Payslip">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
