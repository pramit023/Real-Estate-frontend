import React, { useState } from 'react';
import axios from 'axios';
import { HiQuestionMarkCircle, HiMail, HiPhone, HiUser } from 'react-icons/hi';
import API_URL from '../../../config';
import { useAuth } from '../../context/AuthContext';

const SellerSupport = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '', 
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState('');
  const [noticeType, setNoticeType] = useState('success');

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setNotice('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setNotice('');

    try {
      const res = await axios.post(`${API_URL}/api/contact`, {
        ...formData,
        role: 'seller',
      });

      setNoticeType('success');
      setNotice(res.data.message || 'Your support request has been sent.');
      setFormData((prev) => ({ ...prev, message: '' }));
    } catch (err) {
      setNoticeType('error');
      setNotice(err.response?.data?.message || 'Unable to send support request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-main mb-1">Support</h1>
        <p className="text-text-muted text-sm">Send a message to the administration team.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
        <form onSubmit={handleSubmit} className="card-premium p-8">
          {notice && (
            <div className={`mb-6 rounded-lg border p-4 ${noticeType === 'success' ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
              {notice}
            </div>
          )}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-text-main">
                <HiUser /> Name
              </span>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-[#e2e8f0] p-3 outline-none focus:border-primary"
              />
            </label>

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-text-main">
                <HiMail /> Email
              </span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-[#e2e8f0] p-3 outline-none focus:border-primary"
              />
            </label>

            <label className="block md:col-span-2">
              <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-text-main">
                <HiPhone /> Phone
              </span>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full rounded-lg border border-[#e2e8f0] p-3 outline-none focus:border-primary"
              />
            </label>

            <label className="block md:col-span-2">
              <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-text-main">
                <HiQuestionMarkCircle /> Message
              </span>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={7}
                className="w-full resize-y rounded-lg border border-[#e2e8f0] p-3 outline-none focus:border-primary"
                placeholder="Tell us what you need help with..."
              />
            </label>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary mt-6">
            {loading ? 'Sending...' : 'Send Support Request'}
          </button>
        </form>

        <aside className="card-premium h-fit p-6">
          <h2 className="mb-4 text-lg font-bold text-text-main">Seller Help</h2>
          <div className="space-y-4 text-sm text-text-muted">
            <p>Use support for approval questions, listing moderation, account updates, and buyer communication issues.</p>
            <p className="rounded-xl bg-[#f8fafc] p-4 font-semibold text-text-main">Typical response time: under 24 hours.</p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default SellerSupport;
