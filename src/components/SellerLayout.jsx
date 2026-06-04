import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { HiMenu, HiX, HiHome, HiOfficeBuilding, HiTrendingUp, HiChatAlt2, HiUser, HiQuestionMarkCircle, HiLogout } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import SellerDashboard from '../pages/seller/SellerDashboard';
import SellerInquiries from '../pages/seller/SellerInquiries';
import SellerListings from '../pages/seller/SellerListings';
import SellerMessages from '../pages/seller/SellerMessages';
import SellerProfile from '../pages/seller/SellerProfile';
import SellerSupport from '../pages/seller/SellerSupport';
import PendingApproval from '../pages/seller/PendingApproval';
import { useAuth } from '../context/AuthContext';
import API_URL from '../../config';
import { sellerLayoutStyles, sellerSidebarStyles } from '../assets/dummyStyles';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: HiHome },
  { id: 'listings', label: 'My Listings', icon: HiOfficeBuilding },
  { id: 'inquiries', label: 'Leads', icon: HiTrendingUp },
  { id: 'messages', label: 'Messages', icon: HiChatAlt2 },
  { id: 'profile', label: 'Profile', icon: HiUser },
  { id: 'support', label: 'Support', icon: HiQuestionMarkCircle },
];

const SellerLayout = ({ initialSection = 'dashboard' }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(initialSection);
  const [sellerStatus, setSellerStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const { logout, token, user, setUser } = useAuth();
  const navigate = useNavigate();

  const loadSellerStatus = useCallback(async () => {
    if (!token) return;

    setStatusLoading(true);

    try {
      const res = await axios.get(`${API_URL}/api/seller/status`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.success) {
        setSellerStatus(res.data.seller);
        setUser(res.data.seller);
        const storage = localStorage.getItem('token') ? localStorage : sessionStorage;
        storage.setItem('user', JSON.stringify(res.data.seller));
      }
    } catch (err) {
      console.error('Unable to load seller status:', err.response?.data || err.message);
    } finally {
      setStatusLoading(false);
    }
  }, [setUser, token]);

  useEffect(() => {
    queueMicrotask(loadSellerStatus);
  }, [loadSellerStatus]);

  const handleSectionChange = (section) => {
    setActiveSection(section);
    setMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isApproved = Boolean(sellerStatus?.isApproved ?? user?.isApproved);

  return (
    <div className={sellerLayoutStyles.container}>
      {/* Sidebar Backdrop */}
      <div
        className={`${sellerSidebarStyles.backdrop} ${menuOpen ? sellerSidebarStyles.backdropVisible : sellerSidebarStyles.backdropHidden}`}
        onClick={() => setMenuOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`${sellerSidebarStyles.sidebar} ${menuOpen ? sellerSidebarStyles.sidebarOpen : sellerSidebarStyles.sidebarClosed}`}>
        <div className={sellerSidebarStyles.logoContainer}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[10px] bg-primary text-white flex items-center justify-center shadow-[0_4px_12px_rgba(13,110,89,0.2)]">
              <HiHome className="text-lg" />
            </div>
            <h1 className="text-[1.25rem] font-extrabold text-[#0d6e59]">RealEstate</h1>
          </div>
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setMenuOpen(false)}
            type="button"
          >
            <HiX className="text-lg text-[#475569]" />
          </button>
        </div>

        {/* Navigation */}
        <nav className={sellerSidebarStyles.nav}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSectionChange(item.id)}
                className={`${sellerSidebarStyles.navLink} ${isActive ? sellerSidebarStyles.navLinkActive : sellerSidebarStyles.navLinkInactive}`}
              >
                <Icon className="text-lg" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className={sellerSidebarStyles.logoutContainer}>
          <button
            type="button"
            className={sellerSidebarStyles.logoutButton}
            onClick={handleLogout}
          >
            <HiLogout className="text-lg" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={sellerLayoutStyles.contentWrapper}>
        <main className={sellerLayoutStyles.main}>
          {statusLoading ? (
            <div className="flex h-full min-h-[400px] items-center justify-center">
              <div className="loader" />
            </div>
          ) : !isApproved ? (
            <PendingApproval userName={sellerStatus?.name || user?.name || 'Seller'} onCheckStatus={loadSellerStatus} />
          ) : (
            <>
              {activeSection === 'dashboard' && <SellerDashboard onAddNew={() => setActiveSection('listings')} />}
              {activeSection === 'listings' && <SellerListings />}
              {activeSection === 'inquiries' && <SellerInquiries onOpenMessages={() => setActiveSection('messages')} />}
              {activeSection === 'messages' && <SellerMessages />}
              {activeSection === 'profile' && <SellerProfile />}
              {activeSection === 'support' && <SellerSupport />}
            </>
          )}
        </main>
      </div>

      {/* Mobile Menu Toggle */}
      <button
        className="fixed bottom-6 right-6 md:hidden z-[900] bg-primary text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-shadow"
        onClick={() => setMenuOpen(true)}
        type="button"
      >
        <HiMenu className="text-xl" />
      </button>
    </div>
  );
};

export default SellerLayout;
