import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileStyles as s } from '../../assets/dummyStyles';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/common/Navbar';

const Profile = () => {
  const navigate = useNavigate();
  const {
    user,
    token,
    fetchProfile,
    updateProfile,
    deleteAccount,
  } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [removeProfilePic, setRemoveProfilePic] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const initialize = async () => {
      if (!user) {
        const freshUser = await fetchProfile();
        if (freshUser) {
          setFormData({
            name: freshUser.name || '',
            phone: freshUser.phone || '',
            address: freshUser.address || '',
          });
          setImagePreview(freshUser.profilePic || '');
        }
      } else {
        setFormData({
          name: user.name || '',
          phone: user.phone || '',
          address: user.address || '',
        });
        setImagePreview(user.profilePic || '');
      }
    };

    initialize();
  }, [token, user, navigate, fetchProfile]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setRemoveProfilePic(false);
    setImagePreview(URL.createObjectURL(file));
    setError('');
    setSuccess('');
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setRemoveProfilePic(true);
    setImagePreview('');
  };

  const handleEdit = () => {
    setIsEditing(true);
    setSuccess('');
    setError('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSuccess('');
    setError('');
    setImageFile(null);
    setRemoveProfilePic(false);
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
      });
      setImagePreview(user.profilePic || '');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const result = await updateProfile({
      ...formData,
      profilePic: imageFile,
      removeProfilePic,
    });

    if (result.success) {
      setSuccess(result.message || 'Profile updated successfully');
      setIsEditing(false);
      setImageFile(null);
      setRemoveProfilePic(false);
      if (result.user) {
        setImagePreview(result.user.profilePic || '');
      }
    } else {
      setError(result.message || 'Unable to update profile');
    }

    setLoading(false);
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      'This action will permanently delete your account. Are you sure?'
    );
    if (!confirmed) return;

    setLoading(true);
    setError('');
    const result = await deleteAccount();
    setLoading(false);

    if (!result.success) {
      setError(result.message || 'Unable to delete account');
    }
  };

  if (!token) {
    return null;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-text-muted">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className={s.containerWrapper(user.role)}>
      {user.role !== 'seller' && <Navbar />}
      <div className={s.mainContainer(user.role)}>
        <header className={s.header}>
          <h1 className={s.pageTitle}>Personal Profile</h1>
          <p className={s.pageSubtitle}>
            Manage your personal information and account settings.
          </p>
        </header>

        <div className={s.card}>
          <div className={s.profileHeader}>
            <div className={s.avatarSection}>
              <div className={s.avatarWrapper}>
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Profile"
                    className={s.avatarImage}
                  />
                ) : (
                  <span className={s.avatarPlaceholder}>
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                )}
              </div>
            </div>

            <div className={s.profileInfo}>
              <h2 className={s.userName}>{user.name}</h2>
              <p className={s.infoLabel}>{user.email}</p>
              <span className={s.roleBadge}>{user.role}</span>
              <p className="text-sm text-text-muted mt-2">
                Member since {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {error && <div className={s.errorMessage}>{error}</div>}
          {success && (
            <div className="p-4 bg-emerald-100 text-emerald-700 rounded-xl mb-6">
              {success}
            </div>
          )}

          {isEditing ? (
            <form onSubmit={handleSubmit} className={s.editForm}>
              <div>
                <label className={s.label}>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={s.input}
                  required
                />
              </div>

              <div>
                <label className={s.label}>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={s.input}
                />
              </div>

              <div>
                <label className={s.label}>Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className={s.input}
                />
              </div>

              <div>
                <label className={s.label}>Profile Photo</label>
                <div className="flex flex-col gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className={s.input}
                  />
                  {(imagePreview || user.profilePic) && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="btn btn-outline w-full"
                    >
                      Remove photo
                    </button>
                  )}
                </div>
              </div>

              <div className={s.formActions}>
                <button type="submit" className={s.saveButton} disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className={s.cancelButton}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>

              <div className="mt-8 pt-8 border-t border-border">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="btn btn-outline w-full text-red-600 border-red-300 hover:bg-red-50"
                  disabled={loading}
                >
                  {loading ? 'Deleting...' : 'Delete Account'}
                </button>
              </div>
            </form>
          ) : (
            <div className={s.infoSection}>
              <div className={s.infoItem}>
                <div className={s.infoIcon}>N</div>
                <div>
                  <p className={s.infoLabel}>Name</p>
                  <p className={s.infoValue}>{user.name}</p>
                </div>
              </div>

              <div className={s.infoItem}>
                <div className={s.infoIcon}>P</div>
                <div>
                  <p className={s.infoLabel}>Phone</p>
                  <p className={s.infoValue}>{user.phone || 'Not provided'}</p>
                </div>
              </div>

              <div className={s.infoItem}>
                <div className={s.infoIcon}>A</div>
                <div>
                  <p className={s.infoLabel}>Address</p>
                  <p className={s.infoValue}>{user.address || 'Not provided'}</p>
                </div>
              </div>

              <div className={s.editButtonWrapper}>
                <button
                  onClick={handleEdit}
                  className={s.editProfileButton}
                >
                  Edit Profile
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
