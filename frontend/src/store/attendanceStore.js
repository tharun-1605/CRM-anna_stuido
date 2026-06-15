import { create } from 'zustand';
import axios from '../api/axios';

const useAttendanceStore = create((set, get) => ({
  todayRecord: null,
  loading: false,

  fetchToday: async () => {
    try {
      set({ loading: true });
      const { data } = await axios.get('/attendance/today');
      set({ todayRecord: data });
    } catch (err) {
      console.error(err);
    } finally {
      set({ loading: false });
    }
  },

  handleAction: async (endpoint, payload = {}) => {
    try {
      set({ loading: true });
      const { data } = await axios.post(`/attendance/${endpoint}`, payload);
      set({ todayRecord: data });
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Action failed' };
    } finally {
      set({ loading: false });
    }
  }
}));

export default useAttendanceStore;
