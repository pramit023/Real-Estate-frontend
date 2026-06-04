import React, { useEffect, useState } from 'react';
import { HiChatAlt2, HiCalendar } from 'react-icons/hi';
import axios from 'axios';
import API_URL from '../../../config';
import { useAuth } from '../../context/AuthContext';
import { adminInquiriesStyles } from '../../assets/dummyStyles';

const AdminInquiries = () => {
  const { token } = useAuth();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadInquiries = async () => {
      if (!token) return;

      setLoading(true);
      setError('');

      try {
        const res = await axios.get(`${API_URL}/api/admin/inquiries`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setInquiries(res.data.inquiries || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load inquiries.');
        console.error('Error loading inquiries:', err);
      } finally {
        setLoading(false);
      }
    };

    loadInquiries();
  }, [token]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    });
  };

  return (
    <div>
      <div className={adminInquiriesStyles.headerContainer}>
        <h1 className={adminInquiriesStyles.headerTitle}>Platform Inquiries</h1>
        <p className={adminInquiriesStyles.headerSubtitle}>
          Review communication between buyers and seller
        </p>
      </div>

      {loading ? (
        <div className={adminInquiriesStyles.emptyState}>
          <div className="text-center">Loading inquiries...</div>
        </div>
      ) : error ? (
        <div className={adminInquiriesStyles.emptyState}>
          <div className="text-center text-red-600">{error}</div>
        </div>
      ) : inquiries.length === 0 ? (
        <div className={adminInquiriesStyles.emptyState}>
          <div className={adminInquiriesStyles.emptyIconWrapper}>
            <HiChatAlt2 className="w-16 h-16 mx-auto" />
          </div>
          <p className={adminInquiriesStyles.emptyText}>No inquiries found.</p>
        </div>
      ) : (
        <div className={adminInquiriesStyles.listContainer}>
          {inquiries.map((inquiry) => (
            <div key={inquiry._id} className={adminInquiriesStyles.inquiryCard}>
              {/* Top Section - Property Info & Date */}
              <div className={adminInquiriesStyles.cardTopSection}>
                <div className={adminInquiriesStyles.propertyInfoWrapper}>
                  <div className={adminInquiriesStyles.propertyIconWrapper}>
                    <HiChatAlt2 className="w-5 h-5" />
                  </div>
                  <div className={adminInquiriesStyles.propertyTextWrapper}>
                    <h3 className={adminInquiriesStyles.propertyTitle}>
                      {inquiry.property?.title || 'Property Name Not Available'}
                    </h3>
                    <p className={adminInquiriesStyles.propertyId}>
                      Property ID: {inquiry.property?._id || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className={adminInquiriesStyles.dateWrapper}>
                  <HiCalendar className={adminInquiriesStyles.dateIcon} />
                  {formatDate(inquiry.createdAt)}
                </div>
              </div>

              {/* Details Grid - Buyer & Seller Info */}
              <div className={adminInquiriesStyles.detailsGrid}>
                {/* Buyer Details */}
                <div className={adminInquiriesStyles.detailCard}>
                  <p className={adminInquiriesStyles.detailLabel}>Buyer Details</p>
                  <p className={adminInquiriesStyles.detailName}>
                    {inquiry.buyer?.name || 'Unknown Buyer'}
                  </p>
                  <p className={adminInquiriesStyles.detailEmail}>
                    {inquiry.buyer?.email || 'No email'}
                  </p>
                </div>

                {/* Seller Details */}
                <div className={adminInquiriesStyles.detailCard}>
                  <p className={adminInquiriesStyles.detailLabel}>Seller Details</p>
                  <p className={adminInquiriesStyles.detailName}>
                    {inquiry.seller?.name || 'Unknown Seller'}
                  </p>
                  <p className={adminInquiriesStyles.detailEmail}>
                    {inquiry.seller?.email || 'No email'}
                  </p>
                </div>
              </div>

              {/* Message Section */}
              <div className={adminInquiriesStyles.messageContainer}>
                <div className={adminInquiriesStyles.messageHeader}>
                  <HiChatAlt2 className="w-4 h-4" />
                  MESSAGE
                </div>
                <p className={adminInquiriesStyles.messageText}>
                  "{inquiry.message || 'No message provided'}"
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminInquiries;
