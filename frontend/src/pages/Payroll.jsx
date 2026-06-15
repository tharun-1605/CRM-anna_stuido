import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { DollarSign, FileText, Download, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Payroll() {
  const [payrolls, setPayrolls] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPayrolls();
  }, []);

  const fetchPayrolls = async () => {
    try {
      // In a real implementation this would fetch from /payrolls
      setTimeout(() => {
        setPayrolls([
          { _id: '1', user: { name: 'John Doe', email: 'john@example.com' }, month: 6, year: 2026, basicSalary: 5000, netPay: 4800, status: 'Paid' },
          { _id: '2', user: { name: 'Jane Smith', email: 'jane@example.com' }, month: 6, year: 2026, basicSalary: 6000, netPay: 5800, status: 'Pending' },
        ]);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      toast.error('Failed to load payrolls');
      setIsLoading(false);
    }
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

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Payroll Processing</h1>
          <p className="text-sm text-gray-500 mt-1">Manage employee salaries and view payment history</p>
        </div>
        <div className="flex space-x-3">
           <button className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center shadow-sm">
             <FileText className="w-4 h-4 mr-2" />
             Export Report
           </button>
           <button className="app-btn-primary flex items-center px-4 py-2">
             <DollarSign className="w-4 h-4 mr-2" />
             Run Payroll
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex items-center">
           <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center mr-4">
              <DollarSign className="w-6 h-6 text-teal-600" />
           </div>
           <div>
             <p className="text-sm text-gray-500 font-medium">Total Processed (June)</p>
             <h3 className="text-2xl font-bold text-gray-800">$10,600</h3>
           </div>
        </div>
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex items-center">
           <div className="w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center mr-4">
              <Clock className="w-6 h-6 text-yellow-600" />
           </div>
           <div>
             <p className="text-sm text-gray-500 font-medium">Pending Payments</p>
             <h3 className="text-2xl font-bold text-gray-800">1</h3>
           </div>
        </div>
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex items-center">
           <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mr-4">
              <FileText className="w-6 h-6 text-blue-600" />
           </div>
           <div>
             <p className="text-sm text-gray-500 font-medium">Payslips Generated</p>
             <h3 className="text-2xl font-bold text-gray-800">2</h3>
           </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
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
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">Loading payroll data...</td>
                </tr>
              ) : payrolls.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">No payroll records found</td>
                </tr>
              ) : (
                payrolls.map((payroll) => (
                  <tr key={payroll._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-800">{payroll.user.name}</div>
                      <div className="text-xs text-gray-500">{payroll.user.email}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">June 2026</td>
                    <td className="px-6 py-4 text-gray-600">${payroll.basicSalary.toLocaleString()}</td>
                    <td className="px-6 py-4 font-medium text-gray-800">${payroll.netPay.toLocaleString()}</td>
                    <td className="px-6 py-4">
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
