import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  HiBadgeCheck,
  HiDownload,
  HiEye,
  HiOfficeBuilding,
  HiPlus,
  HiSearch,
  HiUserGroup,
} from 'react-icons/hi';
import API_URL from '../../../config';
import { useAuth } from '../../context/AuthContext';

const statCards = [
  { key: 'totalViews', label: 'Total Views', icon: HiEye },
  { key: 'activeLeads', label: 'Active Leads', icon: HiUserGroup },
  { key: 'liveListings', label: 'Live Listings', icon: HiOfficeBuilding },
  { key: 'propertiesSold', label: 'Properties Sold', icon: HiBadgeCheck },
];

const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price || 0);

const formatDate = (value) => {
  if (!value) return 'Unknown';
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const SellerDashboard = ({ onAddNew }) => {
  const { token } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadDashboard = async () => {
      if (!token) return;

      setLoading(true);
      setError('');

      try {
        const res = await axios.get(`${API_URL}/api/property/seller/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setDashboard(res.data.dashboard);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    queueMicrotask(loadDashboard);
  }, [token]);

  const inquiries = dashboard?.recentInquiries || [];

  const filteredListings = useMemo(() => {
    const listings = dashboard?.listings || [];
    const query = searchTerm.trim().toLowerCase();
    if (!query) return listings;

    return listings.filter((property) => {
      const searchable = [
        property.title,
        property.city,
        property.area,
        property.propertyType,
        property.status,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchable.includes(query);
    });
  }, [dashboard?.listings, searchTerm]);

  const handleExport = () => {
    const rows = [
      ['Title', 'City', 'Area', 'Type', 'Status', 'Price', 'Views', 'Verified'],
      ...filteredListings.map((property) => [
        property.title || '',
        property.city || '',
        property.area || '',
        property.propertyType || '',
        property.status || '',
        property.price || 0,
        property.views || 0,
        property.isVerified ? 'Yes' : 'No',
      ]),
    ];

    const csv = rows
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'seller-listings.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  if (loading) {
    return (
      <div className="flex min-h-[520px] items-center justify-center">
        <div className="loader" />
      </div>
    );
  }

  return (
    <div className="min-h-full bg-white px-2 py-2 md:px-0">
      <div className="mb-9 flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
        <div>
          <h1 className="mb-2 text-[1.875rem] font-extrabold leading-tight text-[#111827]">
            Seller Dashboard
          </h1>
          <p className="text-[0.95rem] text-[#6b7280]">
            Manage your property portfolio and track performance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex h-12 items-center gap-2 rounded-[8px] bg-white px-4 text-sm font-extrabold text-[#111827] hover:bg-[#f8fafc]"
          >
            <HiDownload className="text-lg" />
            Export
          </button>
          <button
            type="button"
            onClick={onAddNew}
            className="inline-flex h-12 items-center gap-2 rounded-[10px] bg-primary px-6 text-sm font-extrabold text-white shadow-[0_10px_20px_rgba(13,148,136,0.18)] hover:bg-primary-dark"
          >
            <HiPlus className="text-xl" />
            Add New
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-[8px] border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <div className="mb-12 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.key}
              className="min-h-[174px] rounded-[8px] border border-[#eef2f7] bg-white p-6 shadow-[0_18px_35px_rgba(15,23,42,0.06)]"
            >
              <div className="mb-7 flex h-10 w-10 items-center justify-center rounded-[8px] bg-[#f1f5f9] text-[#111827]">
                <Icon className="text-lg" />
              </div>
              <p className="mb-3 text-[0.8125rem] font-bold text-[#6b7280]">{item.label}</p>
              <p className="text-[1.625rem] font-extrabold leading-none text-[#111827]">
                {dashboard?.stats?.[item.key] || 0}
              </p>
            </div>
          );
        })}
      </div>

      <section className="mb-14">
        <div className="mb-4 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <h2 className="text-[1.35rem] font-extrabold text-[#111827]">Property Listings</h2>
          <label className="relative block w-full md:w-[300px]">
            <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search Listings...."
              className="h-11 w-full rounded-[8px] border border-[#e5e7eb] bg-white pl-11 pr-4 text-sm outline-none transition focus:border-primary"
            />
          </label>
        </div>

        <div className="min-h-[155px] overflow-hidden rounded-[8px] border border-[#e5e7eb] bg-white shadow-[0_14px_28px_rgba(15,23,42,0.10)]">
          {filteredListings.length === 0 ? (
            <div className="flex min-h-[155px] items-center justify-center px-6 text-center text-[#6b7280]">
              No properties found matching &quot;{searchTerm}&quot;.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] border-collapse text-left">
                <thead className="bg-[#f8fafc] text-[0.74rem] uppercase text-[#64748b]">
                  <tr>
                    <th className="px-6 py-4 font-extrabold">Property</th>
                    <th className="px-6 py-4 font-extrabold">Location</th>
                    <th className="px-6 py-4 font-extrabold">Price</th>
                    <th className="px-6 py-4 font-extrabold">Views</th>
                    <th className="px-6 py-4 font-extrabold">Status</th>
                    <th className="px-6 py-4 font-extrabold">Listed</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredListings.map((property) => (
                    <tr key={property._id} className="border-t border-[#eef2f7]">
                      <td className="px-6 py-4">
                        <p className="font-extrabold text-[#111827]">{property.title}</p>
                        <p className="text-xs capitalize text-[#64748b]">{property.propertyType}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#64748b]">
                        {[property.area, property.city].filter(Boolean).join(', ')}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-[#111827]">{formatPrice(property.price)}</td>
                      <td className="px-6 py-4 text-sm text-[#64748b]">{property.views || 0}</td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-extrabold capitalize ${
                          property.status === 'sold'
                            ? 'bg-[#f1f5f9] text-[#475569]'
                            : property.isVerified
                              ? 'bg-[#dcfce7] text-[#166534]'
                              : 'bg-[#fef3c7] text-[#92400e]'
                        }`}
                        >
                          {property.status === 'sold' ? 'sold' : property.isVerified ? 'live' : 'pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#64748b]">{formatDate(property.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        <section className="min-h-[225px] rounded-[8px] border border-[#eef2f7] bg-white p-6 shadow-[0_14px_28px_rgba(15,23,42,0.06)]">
          <h2 className="mb-2 text-[1.1rem] font-extrabold text-[#111827]">Recent Lead Inquiries</h2>
          <p className="mb-8 text-sm text-[#6b7280]">New messages from potential buyers.</p>

          {inquiries.length === 0 ? (
            <div className="flex min-h-[110px] items-center justify-center text-[#6b7280]">
              No recent inquiries.
            </div>
          ) : (
            <div className="space-y-4">
              {inquiries.map((inquiry) => (
                <div key={inquiry._id} className="rounded-[8px] border border-[#eef2f7] p-4">
                  <div className="mb-1 flex items-center justify-between gap-3">
                    <p className="font-extrabold text-[#111827]">{inquiry.buyer?.name || 'Buyer'}</p>
                    <span className="text-xs text-[#94a3b8]">{formatDate(inquiry.createdAt)}</span>
                  </div>
                  <p className="mb-2 text-xs font-semibold text-[#64748b]">{inquiry.property?.title}</p>
                  <p className="line-clamp-2 text-sm text-[#475569]">{inquiry.message}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="min-h-[225px] rounded-[8px] border border-[#eef2f7] bg-white p-6 shadow-[0_14px_28px_rgba(15,23,42,0.06)]">
          <h2 className="mb-2 text-[1.1rem] font-extrabold text-[#111827]">Quick Tips</h2>
          <div className="mt-2 space-y-5">
            <div className="rounded-[8px] border border-[#ccfbf1] bg-[#f0fdfa] p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-extrabold text-primary">
                <HiEye />
                High Views!
              </div>
              <p className="text-xs font-medium text-[#0f766e]">
                Your listings are trending. Try adding video tours to increase interest.
              </p>
            </div>
            <div className="rounded-[8px] bg-[#f8fafc] p-4">
              <p className="mb-2 text-sm font-extrabold text-[#4b5563]">Market Insight</p>
              <p className="text-xs font-medium text-[#6b7280]">
                Properties in your area are selling fast. Your prices are competitive.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SellerDashboard;
