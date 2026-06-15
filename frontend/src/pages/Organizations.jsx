import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { Building2, Plus, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Organizations() {
  const [organizations, setOrganizations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      // In a real implementation this would fetch from /organizations
      // const { data } = await axios.get('/organizations');
      // setOrganizations(data);
      setTimeout(() => {
        setOrganizations([
          { _id: '1', name: 'Acme Corp', email: 'contact@acme.com', isActive: true, createdAt: '2023-01-01' },
          { _id: '2', name: 'Global Tech', email: 'info@globaltech.com', isActive: true, createdAt: '2023-02-15' },
        ]);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      toast.error('Failed to load organizations');
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Organizations</h1>
          <p className="text-sm text-gray-500 mt-1">Manage tenant organizations and their details</p>
        </div>
        <button className="app-btn-primary flex items-center px-4 py-2">
          <Plus className="w-4 h-4 mr-2" />
          Add Organization
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Joined Date</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">Loading organizations...</td>
                </tr>
              ) : organizations.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No organizations found</td>
                </tr>
              ) : (
                organizations.map((org) => (
                  <tr key={org._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-md bg-teal-50 text-teal-600 flex items-center justify-center mr-3">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-gray-800">{org.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{org.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${org.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {org.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{new Date(org.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end space-x-2">
                        <button className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                          <Trash2 className="w-4 h-4" />
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
