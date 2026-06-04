import React, { useEffect, useState } from 'react';
import { HiChatAlt2, HiCalendar, HiPhone } from 'react-icons/hi';
import axios from 'axios';
import API_URL from '../../../config';
import { useAuth } from '../../context/AuthContext';

const SellerInquiries = ({ onOpenMessages }) => {
  const { token } = useAuth();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedInquiry, setSelectedInquiry] = useState(null);

  useEffect(() => {
    const loadInquiries = async () => {
      if (!token) return;

      setLoading(true);
      setError('');

      try {
        const res = await axios.get(`${API_URL}/api/seller/inquiries`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setInquiries(res.data.inquiries || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load inquiries');
        console.error('Error loading inquiries:', err);
      } finally {
        setLoading(false);
      }
    };

    loadInquiries();
  }, [token]);

  const handleMarkAsRead = async (inquiryId) => {
    try {
      await axios.patch(
        `${API_URL}/api/seller/inquiries/${inquiryId}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // Update local state
      setInquiries(
        inquiries.map((inq) =>
          inq._id === inquiryId ? { ...inq, isRead: true } : inq
        )
      );
      
      if (selectedInquiry?._id === inquiryId) {
        setSelectedInquiry({ ...selectedInquiry, isRead: true });
      }
    } catch (err) {
      console.error('Error marking inquiry as read:', err);
    }
  };

  const handleContactBuyer = async () => {
    if (!selectedInquiry) return;

    try {
      await axios.post(`${API_URL}/api/chat/start`, {
        propertyId: selectedInquiry.property?._id,
        buyerId: selectedInquiry.buyer?._id,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      onOpenMessages?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to start buyer chat.');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-4" />
          <p>Loading inquiries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Inquiries</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inquiries List */}
        <div className="lg:col-span-2">
          {inquiries.length === 0 ? (
            <div className="bg-gray-50 p-8 rounded-lg text-center text-gray-600">
              <HiChatAlt2 className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p>No inquiries received yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {inquiries.map((inquiry) => (
                <div
                  key={inquiry._id}
                  onClick={() => {
                    setSelectedInquiry(inquiry);
                    if (!inquiry.isRead) {
                      handleMarkAsRead(inquiry._id);
                    }
                  }}
                  className={`p-6 rounded-lg border-2 cursor-pointer transition ${
                    selectedInquiry?._id === inquiry._id
                      ? 'border-primary bg-primary-light'
                      : inquiry.isRead
                      ? 'border-gray-200 bg-white hover:border-gray-300'
                      : 'border-blue-300 bg-blue-50 hover:border-blue-400'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-800">
                        {inquiry.buyer?.name}
                      </h3>
                      <p className="text-sm text-gray-600">{inquiry.property?.title}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ml-4 ${
                        inquiry.isRead
                          ? 'bg-gray-100 text-gray-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {inquiry.isRead ? 'Read' : 'New'}
                    </span>
                  </div>

                  <p className="text-gray-700 mb-3 line-clamp-2">
                    "{inquiry.message}"
                  </p>

                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <span className="flex items-center gap-1">
                      <HiCalendar /> {formatDate(inquiry.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Inquiry Details */}
        {selectedInquiry ? (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-6">Inquiry Details</h2>

            {/* Buyer Info */}
            <div className="mb-6 pb-6 border-b">
              <p className="text-sm text-gray-600 mb-2">BUYER</p>
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                {selectedInquiry.buyer?.name}
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  {/* <HiEnvelope className="w-4 h-4" /> */}
                  {selectedInquiry.buyer?.email}
                </div>
                {selectedInquiry.buyer?.phone && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <HiPhone className="w-4 h-4" />
                    {selectedInquiry.buyer?.phone}
                  </div>
                )}
              </div>
            </div>

            {/* Property Info */}
            <div className="mb-6 pb-6 border-b">
              <p className="text-sm text-gray-600 mb-2">PROPERTY</p>
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                {selectedInquiry.property?.title}
              </h3>
              <p className="text-sm text-primary font-semibold">
                {formatPrice(selectedInquiry.property?.price)}
              </p>
              <p className="text-sm text-gray-600">{selectedInquiry.property?.city}</p>
            </div>

            {/* Message */}
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2">MESSAGE</p>
              <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-primary">
                <p className="text-gray-800 italic">
                  "{selectedInquiry.message}"
                </p>
              </div>
            </div>

            {/* Date */}
            <div className="text-sm text-gray-600">
              Received: {formatDate(selectedInquiry.createdAt)}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 space-y-2">
              {!selectedInquiry.isRead && (
                <button
                  onClick={() => handleMarkAsRead(selectedInquiry._id)}
                  className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-600 transition"
                >
                  Mark as Read
                </button>
              )}
              <button
                onClick={handleContactBuyer}
                className="w-full bg-primary text-white py-2 px-4 rounded-lg font-semibold hover:bg-primary-dark transition"
              >
                Contact Buyer
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-600">
            <p>Select an inquiry to view details</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerInquiries;
