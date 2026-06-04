import React, { useEffect, useState } from 'react';
import { HiUser, HiMail, HiPhone, HiLocationMarker, HiPencil, HiSave } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';

const SellerProfile = () => {
  const { user, updateProfile } = useAuth();
  const profile = user;
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    if (user) {
      queueMicrotask(() => setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
      }));
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage('');

    try {
      const result = await updateProfile(formData);
      if (result.success) {
        setEditing(false);
        setMessageType('success');
        setMessage('Profile updated successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessageType('error');
        setMessage(result.message || 'Failed to update profile.');
      }
    } catch (err) {
      setMessageType('error');
      setMessage('An error occurred while updating profile.');
      console.error('Error updating profile:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return (
      <div className="card-premium p-8 text-center">
        <div className="animate-spin inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-4" />
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-main mb-1">My Profile</h1>
        <p className="text-text-muted text-sm">Manage your seller profile information.</p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg mb-6 ${
            messageType === 'success'
              ? 'bg-[#dcfce7] text-[#166534] border border-[#b7e4c7]'
              : 'bg-[#fee2e2] text-[#991b1b] border border-[#fca5a5]'
          }`}
        >
          {message}
        </div>
      )}

      <div className="card-premium p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold text-text-main">Account Information</h2>
          <button
            onClick={() => (editing ? handleSave() : setEditing(true))}
            disabled={loading}
            className="btn btn-primary flex items-center gap-2"
            type="button"
          >
            {editing ? (
              <>
                <HiSave className="w-4 h-4" />
                Save Changes
              </>
            ) : (
              <>
                <HiPencil className="w-4 h-4" />
                Edit Profile
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-text-main mb-2">
              <HiUser className="w-4 h-4 inline mr-2" />
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name || ''}
              onChange={handleInputChange}
              disabled={!editing}
              className="w-full p-3 rounded-lg border border-[#e2e8f0] bg-white focus:border-primary outline-none transition-colors disabled:bg-[#f8fafc] disabled:text-[#94a3b8]"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-text-main mb-2">
              <HiMail className="w-4 h-4 inline mr-2" />
              Email Address
            </label>
            <input
              type="email"
              value={profile.email || ''}
              disabled
              className="w-full p-3 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] text-[#94a3b8] outline-none cursor-not-allowed"
            />
            <p className="text-xs text-text-muted mt-1">Email cannot be changed.</p>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold text-text-main mb-2">
              <HiPhone className="w-4 h-4 inline mr-2" />
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone || ''}
              onChange={handleInputChange}
              disabled={!editing}
              className="w-full p-3 rounded-lg border border-[#e2e8f0] bg-white focus:border-primary outline-none transition-colors disabled:bg-[#f8fafc] disabled:text-[#94a3b8]"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-semibold text-text-main mb-2">
              <HiLocationMarker className="w-4 h-4 inline mr-2" />
              Address
            </label>
            <input
              type="text"
              name="address"
              value={formData.address || ''}
              onChange={handleInputChange}
              disabled={!editing}
              className="w-full p-3 rounded-lg border border-[#e2e8f0] bg-white focus:border-primary outline-none transition-colors disabled:bg-[#f8fafc] disabled:text-[#94a3b8]"
            />
          </div>

          {/* User Type */}
          <div>
            <label className="block text-sm font-semibold text-text-main mb-2">
              Account Type
            </label>
            <input
              type="text"
              value={profile.role?.charAt(0).toUpperCase() + profile.role?.slice(1) || 'User'}
              disabled
              className="w-full p-3 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] text-[#94a3b8] outline-none cursor-not-allowed"
            />
          </div>

          {/* Member Since */}
          <div>
            <label className="block text-sm font-semibold text-text-main mb-2">
              Member Since
            </label>
            <input
              type="text"
              value={
                profile.createdAt
                  ? new Date(profile.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'N/A'
              }
              disabled
              className="w-full p-3 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] text-[#94a3b8] outline-none cursor-not-allowed"
            />
          </div>
        </div>

        {editing && (
          <div className="mt-6 p-4 bg-[#eff6ff] border border-[#bfdbfe] text-[#1e40af] rounded-lg text-sm">
            Click the "Save Changes" button to apply your changes.
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerProfile;
