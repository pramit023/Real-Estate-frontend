import React, { useEffect, useState } from 'react';
import { HiMail, HiCheckCircle, HiUserGroup } from 'react-icons/hi';
import axios from 'axios';
import API_URL from '../../../config';
import { useAuth } from '../../context/AuthContext';
import { sellerRequestsStyles } from '../../assets/dummyStyles';

const getInitials = (name) => {
  if (!name) return 'S';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((item) => item[0].toUpperCase())
    .join('');
};

const formatDate = (value) => {
  if (!value) return 'Unknown';
  const date = new Date(value);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const SellerRequest = () => {
  const { token } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [approvingIds, setApprovingIds] = useState([]);

  useEffect(() => {
    const loadRequests = async () => {
      if (!token) return;

      setLoading(true);
      setError('');

      try {
        const res = await axios.get(`${API_URL}/api/admin/pending-sellers`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setRequests(res.data.pendingSellers || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load seller requests.');
      } finally {
        setLoading(false);
      }
    };

    loadRequests();
  }, [token]);

  const handleApprove = async (sellerId) => {
    if (!window.confirm('Approve this seller request?')) return;

    setApprovingIds((prev) => [...prev, sellerId]);

    try {
      await axios.patch(`${API_URL}/api/admin/verify-seller/${sellerId}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setRequests((prev) => prev.filter((request) => request._id !== sellerId));
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to approve seller request.');
    } finally {
      setApprovingIds((prev) => prev.filter((id) => id !== sellerId));
    }
  };

  return (
    <div className={sellerRequestsStyles.container}>
      <div className={sellerRequestsStyles.headerContainer}>
        <h1 className={sellerRequestsStyles.pageTitle}>Seller Verification</h1>
        <p className={sellerRequestsStyles.pageSubtitle}>Review and approve new seller registration requests.</p>
      </div>

      <div className={sellerRequestsStyles.card}>
        <div className={sellerRequestsStyles.cardInner}>
          <h2 className={sellerRequestsStyles.sectionTitle}>Pending Requests ({requests.length})</h2>

          {loading ? (
            <div className={sellerRequestsStyles.emptyState}>Loading pending requests...</div>
          ) : error ? (
            <div className={sellerRequestsStyles.emptyState}>{error}</div>
          ) : requests.length === 0 ? (
            <div className={sellerRequestsStyles.emptyState}>
              <HiCheckCircle className={`${sellerRequestsStyles.emptyStateIcon} text-5xl`} />
              <p>No Pending seller requests at the moment.</p>
            </div>
          ) : (
            <div className={sellerRequestsStyles.requestGrid}>
              {requests.map((request) => (
                <div key={request._id} className={sellerRequestsStyles.requestCard}>
                  <div className={sellerRequestsStyles.requestHeader}>
                    <div className={sellerRequestsStyles.avatar}>{getInitials(request.name)}</div>
                    <div>
                      <div className={sellerRequestsStyles.requestName}>{request.name}</div>
                      <div className={sellerRequestsStyles.requestDate}>
                        <HiUserGroup className="inline-block" />
                        Requested on {formatDate(request.createdAt)}
                      </div>
                    </div>
                  </div>

                  <div className={sellerRequestsStyles.contactInfo}>
                    <div className={sellerRequestsStyles.contactItem}>
                      <HiMail className="text-lg" />
                      <span>{request.email}</span>
                    </div>
                    <div className={sellerRequestsStyles.contactItem}>
                      <span className="font-semibold">Role:</span> {request.role || 'seller'}
                    </div>
                  </div>

                  <button
                    type="button"
                    className={sellerRequestsStyles.approveButton}
                    onClick={() => handleApprove(request._id)}
                    disabled={approvingIds.includes(request._id)}
                  >
                    <HiCheckCircle className="text-lg" />
                    {approvingIds.includes(request._id) ? 'Approving...' : 'Approve Seller'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerRequest;
