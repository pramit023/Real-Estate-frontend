import React, { useEffect, useMemo, useState } from 'react';
import { HiFilter, HiLockClosed, HiLockOpen, HiTrash } from 'react-icons/hi';
import axios from 'axios';
import API_URL from '../../../config';
import { useAuth } from '../../context/AuthContext';
import { adminUsersStyles } from '../../assets/dummyStyles';

const roleLabels = [
  { value: 'all', label: 'All Users' },
  { value: 'buyer', label: 'Buyers' },
  { value: 'seller', label: 'Sellers' },
  { value: 'admin', label: 'Admins' },
];

const getInitials = (name) => {
  if (!name) return 'U';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
};

const AdminUser = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    const loadUsers = async () => {
      if (!token) return;

      setLoading(true);
      setError('');

      try {
        const res = await axios.get(`${API_URL}/api/admin/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUsers(res.data.users || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load users.');
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [token]);

  const handleBlockToggle = async (userId) => {
    try {
      const res = await axios.patch(`${API_URL}/api/admin/users/${userId}/block`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers((prev) => prev.map((user) => (user._id === userId ? { ...user, isBlocked: res.data.isBlocked } : user)));
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update user status.');
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Delete this user permanently?')) return;

    try {
      await axios.delete(`${API_URL}/api/admin/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers((prev) => prev.filter((user) => user._id !== userId));
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete user.');
    }
  };

  const filteredUsers = useMemo(() => {
    if (filter === 'all') return users;
    return users.filter((user) => user.role === filter);
  }, [filter, users]);

  const usersCount = filteredUsers.length;

  return (
    <div className="card-premium overflow-hidden p-0">
      <div className={adminUsersStyles.cardHeader}>
        <div className={adminUsersStyles.cardTitleRow}>
          <div>
            <h1 className={adminUsersStyles.cardTitle}>User Management</h1>
            <p className={adminUsersStyles.headerSubtitle}>Monitor platform users and access levels.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className={adminUsersStyles.filterButton}
              onClick={() => setFilterOpen((prev) => !prev)}
            >
              <HiFilter className="text-lg" />
              Filter
            </button>
            <span className="text-sm text-text-muted">Showing {usersCount} users</span>
          </div>
        </div>
        {filterOpen && (
          <div className={adminUsersStyles.filterDropdown}>
            {roleLabels.map((item) => (
              <button
                key={item.value}
                type="button"
                className={adminUsersStyles.filterOption(filter === item.value)}
                onClick={() => {
                  setFilter(item.value);
                  setFilterOpen(false);
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={adminUsersStyles.tableWrapper}>
        <table className={adminUsersStyles.table}>
          <thead className={adminUsersStyles.thead}>
            <tr className={adminUsersStyles.tableRow}>
              <th className={adminUsersStyles.thUserInfo}>USER INFO</th>
              <th className={adminUsersStyles.thRole}>ROLE</th>
              <th className={adminUsersStyles.thContact}>CONTACT DETAILS</th>
              <th className={adminUsersStyles.thStatus}>ACCOUNT STATUS</th>
              <th className={adminUsersStyles.thActions}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr className={adminUsersStyles.tableRow}>
                <td colSpan="5" className={adminUsersStyles.emptyState}>
                  Loading users...
                </td>
              </tr>
            ) : error ? (
              <tr className={adminUsersStyles.tableRow}>
                <td colSpan="5" className={adminUsersStyles.emptyState}>
                  {error}
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr className={adminUsersStyles.tableRow}>
                <td colSpan="5" className={adminUsersStyles.emptyState}>
                  No users found.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user._id} className={adminUsersStyles.tableRow}>
                  <td className={adminUsersStyles.tdUserInfo}>
                    <div className="flex items-center gap-4">
                      <div className={adminUsersStyles.userAvatar}>{getInitials(user.name)}</div>
                      <div>
                        <div className={adminUsersStyles.userInfoName}>{user.name}</div>
                        <div className={adminUsersStyles.userInfoId}>ID: {user._id.slice(-8).toUpperCase()}</div>
                      </div>
                    </div>
                  </td>
                  <td className={adminUsersStyles.tdRole}>
                    <span className={adminUsersStyles.roleBadge(user.role)}>{user.role}</span>
                  </td>
                  <td className={adminUsersStyles.tdContact}>
                    <div className={adminUsersStyles.contactWrapper}>
                      <span className={adminUsersStyles.contactEmail}>{user.email}</span>
                      <span className={adminUsersStyles.contactPhone}>{user.phone || '-'}</span>
                    </div>
                  </td>
                  <td className={adminUsersStyles.tdStatus}>
                    <span className={user.isBlocked ? adminUsersStyles.statusBadgeBlocked : adminUsersStyles.statusBadgeActive}>
                      {user.isBlocked ? 'Suspended' : 'Active'}
                    </span>
                  </td>
                  <td className={adminUsersStyles.tdActions}>
                    <div className={adminUsersStyles.actionsWrapper}>
                      <button
                        type="button"
                        className={adminUsersStyles.blockButton(user.isBlocked)}
                        onClick={() => handleBlockToggle(user._id)}
                        title={user.isBlocked ? 'Unblock user' : 'Block user'}
                      >
                        {user.isBlocked ? <HiLockOpen className="text-lg" /> : <HiLockClosed className="text-lg" />}
                      </button>
                      <button
                        type="button"
                        className={adminUsersStyles.deleteButton}
                        onClick={() => handleDelete(user._id)}
                        title="Delete user"
                      >
                        <HiTrash className="text-lg" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUser;