import React, { useEffect, useState } from 'react';
import { HiAtSymbol, HiPhone, HiClock, HiUser } from 'react-icons/hi';
import axios from 'axios';
import API_URL from '../../../config';
import { useAuth } from '../../context/AuthContext';
import { adminContactsStyles } from '../../assets/dummyStyles';

const AdminContact = () => {
  const { token } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadContacts = async () => {
      if (!token) return;

      setLoading(true);
      setError('');

      try {
        const res = await axios.get(`${API_URL}/api/contact`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setContacts(res.data.contacts || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load contact requests.');
        console.error('Failed to fetch contacts:', err);
      } finally {
        setLoading(false);
      }
    };

    loadContacts();
  }, [token]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div className={adminContactsStyles.container}>
      <div className="mb-8">
        <h1 className={adminContactsStyles.heading}>Contact Requests</h1>
        <p className={adminContactsStyles.subheading}>Read and manage inquires from platform users.</p>
      </div>

      <div className={adminContactsStyles.card}>
        <div className={adminContactsStyles.cardHeader}>
          <h2 className={adminContactsStyles.cardTitle}>Inbox ({contacts.length})</h2>
        </div>

        {loading ? (
          <div className={adminContactsStyles.emptyState}>Loading contact requests...</div>
        ) : error ? (
          <div className={adminContactsStyles.emptyState}>
            <p className="text-red-600">{error}</p>
          </div>
        ) : contacts.length === 0 ? (
          <div className={adminContactsStyles.emptyState}>
            <p>No contact requests available yet.</p>
          </div>
        ) : (
          <div className={adminContactsStyles.contactList}>
            {contacts.map((contact, index) => (
              <div key={contact._id} className={adminContactsStyles.contactItem(index, contacts.length)}>
                <div className={adminContactsStyles.contactHeader}>
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className={adminContactsStyles.avatarWrapper(contact.role)}>
                      {contact.name?.charAt(0)?.toUpperCase() || <HiUser className="w-5 h-5" />}
                    </div>
                    <div className="min-w-0">
                      <div className={adminContactsStyles.nameBadgeContainer}>
                        <h3 className={adminContactsStyles.name}>{contact.name || 'Anonymous'}</h3>
                        <span className={adminContactsStyles.roleBadge(contact.role)}>
                          {contact.role?.toUpperCase() || 'USER'}
                        </span>
                      </div>
                      <div className={adminContactsStyles.contactDetails}>
                        <div className={adminContactsStyles.detailItem}>
                          <HiAtSymbol className="w-4 h-4" />
                          {contact.email}
                        </div>
                        <div className={adminContactsStyles.detailItem}>
                          <HiPhone className="w-4 h-4" />
                          {contact.phone || 'No phone number'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={adminContactsStyles.detailItem}>
                    <HiClock className="w-4 h-4" />
                    {formatDate(contact.createdAt)}
                  </div>
                </div>

                <div className={adminContactsStyles.messageBox}>
                  {contact.message || 'No message provided.'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};


export default AdminContact