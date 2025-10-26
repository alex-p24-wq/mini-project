import api from './api';

export const submitFeedback = async ({ subject, message, rating = 5, category = 'General' }) => {
  try {
    const res = await api.post('/feedback', { subject, message, rating, category });
    return res.data;
  } catch (error) {
    const msg = error?.response?.data?.message || error?.message || 'Failed to submit feedback';
    throw { message: msg };
  }
};

export const adminListFeedback = async (params = {}) => {
  try {
    const res = await api.get('/admin/feedback', { params });
    return res.data;
  } catch (error) {
    const msg = error?.response?.data?.message || error?.message || 'Failed to fetch feedback';
    throw { message: msg };
  }
};