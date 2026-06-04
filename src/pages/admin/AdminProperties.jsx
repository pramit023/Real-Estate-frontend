import React, { useEffect, useState } from 'react';
import { HiCheckCircle, HiTrash, HiCurrencyRupee } from 'react-icons/hi';
import axios from 'axios';
import API_URL from '../../../config';
import { useAuth } from '../../context/AuthContext';
import { adminPropertiesStyles } from '../../assets/dummyStyles';

const getInitials = (name) => {
  if (!name) return 'P';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((item) => item[0].toUpperCase())
    .join('');
};

const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '-';
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
};

const AdminProperties = () => {
  const { token } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionIds, setActionIds] = useState([]);

  useEffect(() => {
    const loadProperties = async () => {
      if (!token) return;

      setLoading(true);
      setError('');

      try {
        const res = await axios.get(`${API_URL}/api/admin/properties`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProperties(res.data.properties || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load properties.');
      } finally {
        setLoading(false);
      }
    };

    loadProperties();
  }, [token]);

  const handleApprove = async (propertyId) => {
    if (!window.confirm('Approve this property listing?')) return;

    setActionIds((prev) => [...prev, propertyId]);

    try {
      await axios.patch(`${API_URL}/api/admin/properties/${propertyId}/verify`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProperties((prev) => prev.filter((property) => property._id !== propertyId));
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to approve property.');
    } finally {
      setActionIds((prev) => prev.filter((id) => id !== propertyId));
    }
  };

  const handleDelete = async (propertyId) => {
    if (!window.confirm('Delete this property permanently?')) return;

    setActionIds((prev) => [...prev, propertyId]);

    try {
      await axios.delete(`${API_URL}/api/admin/properties/${propertyId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProperties((prev) => prev.filter((property) => property._id !== propertyId));
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete property.');
    } finally {
      setActionIds((prev) => prev.filter((id) => id !== propertyId));
    }
  };

  return (
    <div>
      <div className={adminPropertiesStyles.headerContainer}>
        <h1 className={adminPropertiesStyles.pageTitle}>Property Moderation</h1>
        <p className={adminPropertiesStyles.pageSubtitle}>Review and manage all property listings across the platform.</p>
      </div>

      {loading ? (
        <div className={adminPropertiesStyles.emptyStateCard}>Loading property moderation queue...</div>
      ) : error ? (
        <div className={adminPropertiesStyles.emptyStateCard}>{error}</div>
      ) : properties.length === 0 ? (
        <div className={adminPropertiesStyles.emptyStateCard}>
          <div className="flex flex-col items-center gap-4">
            <HiCheckCircle className="text-5xl text-[#94a3b8]" />
            <p>No properties pending moderation.</p>
          </div>
        </div>
      ) : (
        <div className={adminPropertiesStyles.propertiesGrid}>
          {properties.map((property) => (
            <div key={property._id} className="card-premium p-6 min-w-0 w-full">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-primary-light text-primary flex items-center justify-center text-xl font-bold">
                  {getInitials(property.title)}
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg font-bold text-text-main truncate">{property.title}</h2>
                  <p className="text-sm text-text-muted truncate">{property.city}, {property.pincode}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 mb-6 sm:grid-cols-2">
                <div className="rounded-2xl bg-[#f8fafc] p-4">
                  <p className="text-xs text-text-muted uppercase tracking-[0.18em] mb-2">Price</p>
                  <p className="font-semibold text-text-main flex items-center gap-2"><HiCurrencyRupee className="inline" />{formatCurrency(property.price)}</p>
                </div>
                <div className="rounded-2xl bg-[#f8fafc] p-4">
                  <p className="text-xs text-text-muted uppercase tracking-[0.18em] mb-2">Type</p>
                  <p className="font-semibold text-text-main capitalize">{property.propertyType}</p>
                </div>
                <div className="rounded-2xl bg-[#f8fafc] p-4">
                  <p className="text-xs text-text-muted uppercase tracking-[0.18em] mb-2">Area</p>
                  <p className="font-semibold text-text-main">{property.areaSize || 'N/A'} sq ft</p>
                </div>
                <div className="rounded-2xl bg-[#f8fafc] p-4">
                  <p className="text-xs text-text-muted uppercase tracking-[0.18em] mb-2">Seller</p>
                  <p className="font-semibold text-text-main">{property.seller?.name || 'Unknown'}</p>
                  <p className="text-[0.8rem] text-text-muted truncate">{property.seller?.email || '-'}</p>
                </div>
              </div>

              <div className={adminPropertiesStyles.actionWrapper}>
                <button
                  type="button"
                  className="btn btn-primary flex items-center gap-2 p-3 w-full"
                  onClick={() => handleApprove(property._id)}
                  disabled={actionIds.includes(property._id)}
                >
                  <HiCheckCircle />
                  {actionIds.includes(property._id) ? 'Approving...' : 'Approve Listing'}
                </button>
                <button
                  type="button"
                  className="btn bg-[#fef2f2] text-[#dc2626] border border-[#fee2e2] p-3 flex items-center gap-2 w-full hover:bg-red-100"
                  onClick={() => handleDelete(property._id)}
                  disabled={actionIds.includes(property._id)}
                >
                  <HiTrash />
                  Delete Listing
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminProperties;
