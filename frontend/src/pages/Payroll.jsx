import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { IndianRupee, FileText, Download, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Payroll() {
  const [payrolls, setPayrolls] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  
  const [editingId, setEditingId] = useState(null);
  const [editSalary, setEditSalary] = useState('');

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

  const startEdit = (payroll) => {
    setEditingId(payroll._id);
    setEditSalary(payroll.basicSalary.toString());
  };

  const handleUpdateSalary = async (id) => {
    try {
      await axios.put(`/payrolls/${id}`, { basicSalary: Number(editSalary) });
      toast.success('Basic salary updated');
      setEditingId(null);
      fetchPayrolls();
    } catch (error) {
      toast.error('Failed to update basic salary');
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
        return <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"><CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Paid</span>;
      case 'Pending':
        return <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200"><Clock className="w-3.5 h-3.5 mr-1.5" /> Pending</span>;
      default:
        return <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200">{status}</span>;
    }
  };

  // Calculate summary stats
  const totalProcessed = payrolls.filter(p => p.status === 'Paid').reduce((sum, p) => sum + p.netPay, 0);
  const pendingCount = payrolls.filter(p => p.status === 'Pending').length;
  const payslipsGenerated = payrolls.length;

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col space-y-6 py-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-2 animate-fade-in-up gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-indigo-600 tracking-tight flex items-center">
            <IndianRupee className="w-8 h-8 mr-3 text-teal-500" />
            Payroll Processing
          </h1>
          <p className="text-gray-500 font-medium text-sm mt-1">Manage employee salaries and view payment history</p>
        </div>
        <div className="flex space-x-3">
           <button className="bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center shadow-sm">
             <FileText className="w-4 h-4 mr-2" />
             Export Report
           </button>
           <button 
             onClick={handleRunPayroll}
             disabled={isRunning}
             className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white shadow-lg hover:shadow-teal-500/30 px-6 py-2.5 rounded-xl font-bold transition-all transform hover:-translate-y-0.5 flex items-center disabled:opacity-50 disabled:transform-none"
           >
             <IndianRupee className="w-4 h-4 mr-2" />
             {isRunning ? 'Running...' : 'Run Payroll'}
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up">
        <div className="app-card p-6 flex items-center relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-24 h-24 bg-teal-50 rounded-full blur-2xl -mr-12 -mt-12 transition-transform group-hover:scale-150"></div>
           <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-100 to-teal-50 flex items-center justify-center mr-5 shadow-sm border border-teal-100 relative z-10">
              <IndianRupee className="w-7 h-7 text-teal-600" />
           </div>
           <div className="relative z-10">
             <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Total Paid ({getMonthName(currentMonth)})</p>
             <h3 className="text-3xl font-black text-gray-800">₹{totalProcessed.toLocaleString()}</h3>
           </div>
        </div>
        <div className="app-card p-6 flex items-center relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-full blur-2xl -mr-12 -mt-12 transition-transform group-hover:scale-150"></div>
           <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center mr-5 shadow-sm border border-amber-100 relative z-10">
              <Clock className="w-7 h-7 text-amber-600" />
           </div>
           <div className="relative z-10">
             <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Pending Payments</p>
             <h3 className="text-3xl font-black text-gray-800">{pendingCount}</h3>
           </div>
        </div>
        <div className="app-card p-6 flex items-center relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full blur-2xl -mr-12 -mt-12 transition-transform group-hover:scale-150"></div>
           <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-100 to-indigo-50 flex items-center justify-center mr-5 shadow-sm border border-indigo-100 relative z-10">
              <FileText className="w-7 h-7 text-indigo-600" />
           </div>
           <div className="relative z-10">
             <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Payslips Generated</p>
             <h3 className="text-3xl font-black text-gray-800">{payslipsGenerated}</h3>
           </div>
        </div>
      </div>

      <div className="app-card flex-1 overflow-hidden flex flex-col animate-fade-in-up animate-stagger-1 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none opacity-50"></div>
        
        <div className="overflow-x-auto flex-1 bg-white/40 backdrop-blur-sm p-6 relative z-10 custom-scrollbar">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden h-full flex flex-col">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50/80 border-b border-gray-200/60 text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-6 py-4 font-bold">Employee</th>
                  <th className="px-6 py-4 font-bold">Period</th>
                  <th className="px-6 py-4 font-bold">Basic Salary</th>
                  <th className="px-6 py-4 font-bold">Net Pay</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      <div className="flex items-center justify-center font-bold">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-500 border-t-transparent mr-3"></div>
                        Calculating payroll data...
                      </div>
                    </td>
                  </tr>
                ) : payrolls.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-20 text-center">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <IndianRupee className="w-10 h-10 text-gray-400" />
                      </div>
                      <h2 className="text-gray-600 font-extrabold text-xl mb-2">No payroll records</h2>
                      <p className="text-gray-400 font-medium text-sm">Click "Run Payroll" to generate payslips for this month.</p>
                    </td>
                  </tr>
                ) : (
                  payrolls.map((payroll) => (
                    <tr key={payroll._id} className="hover:bg-teal-50/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-700 flex items-center justify-center font-extrabold text-xs mr-3 shadow-sm">
                            {payroll.user?.name ? payroll.user.name.substring(0,2).toUpperCase() : '?'}
                          </div>
                          <div>
                            <div className="font-bold text-gray-800">{payroll.user?.name || 'Unknown'}</div>
                            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mt-0.5">{payroll.user?.email || ''}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-bold">{getMonthName(payroll.month)} {payroll.year}</td>
                      <td className="px-6 py-4 text-gray-500 font-semibold group relative">
                        {editingId === payroll._id ? (
                          <input 
                            type="number" 
                            value={editSalary} 
                            onChange={(e) => setEditSalary(e.target.value)} 
                            className="app-input px-2 py-1 text-sm w-24"
                          />
                        ) : (
                          <span>₹{payroll.basicSalary.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-black text-gray-800 text-base group-hover:text-teal-700 transition-colors">
                        {editingId === payroll._id ? (
                          <span className="text-teal-600">₹{Number(editSalary).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                        ) : (
                          <span>₹{payroll.netPay.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 cursor-pointer" onClick={() => handleStatusChange(payroll._id, payroll.status === 'Paid' ? 'Pending' : 'Paid')} title="Click to toggle status">
                        {getStatusBadge(payroll.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end space-x-2">
                          {editingId === payroll._id ? (
                            <>
                              <button onClick={() => handleUpdateSalary(payroll._id)} className="bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1.5 rounded-md font-bold text-xs transition-colors">Save</button>
                              <button onClick={() => setEditingId(null)} className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-3 py-1.5 rounded-md font-bold text-xs transition-colors">Cancel</button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => startEdit(payroll)} className="text-indigo-600 hover:text-indigo-800 font-bold text-sm transition-colors opacity-0 group-hover:opacity-100 mr-2">Edit</button>
                              <button className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors border border-transparent hover:border-teal-100" title="Download Payslip">
                                <Download className="w-5 h-5" />
                              </button>
                            </>
                          )}
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
    </div>
  );
}
