import React, { useEffect, useState } from 'react';
import { HiMenu, HiX, HiHome, HiUsers, HiUserGroup, HiOfficeBuilding, HiChatAlt2, HiMail, HiLogout, HiRefresh } from 'react-icons/hi';
import AdminUser from '../pages/admin/AdminUser';
import SellerRequest from '../pages/admin/SellerRequest';
import AdminProperties from '../pages/admin/AdminProperties';
import AdminInquiries from '../pages/admin/AdminInquiries';
import AdminContact from '../pages/admin/AdminContact';
import { useAuth } from '../context/AuthContext';
import { adminLayoutStyles, adminSidebarStyles, dashboardNavbarStyles, adminDashboardStyles } from '../assets/dummyStyles';

const navItems = [
  { id: 'overview', label: 'Overview', icon: HiHome },
  { id: 'users', label: 'Users', icon: HiUsers },
  { id: 'seller-requests', label: 'Seller Requests', icon: HiUserGroup },
  { id: 'properties', label: 'Properties', icon: HiOfficeBuilding },
  { id: 'inquiries', label: 'Inquiries', icon: HiChatAlt2 },
  { id: 'contact', label: 'Contact Inbox', icon: HiMail },
];

const overviewStats = [
  { label: 'Total Users', value: 2, accent: 'bg-[#dbeafe] text-[#1e40af]' },
  { label: 'Total Properties', value: 1, accent: 'bg-[#fef3c7] text-[#92400e]' },
  { label: 'Active Listings', value: 1, accent: 'bg-[#dcfce7] text-[#166534]' },
  { label: 'Sold Properties', value: 0, accent: 'bg-[#ede9fe] text-[#5b21b6]' },
];

const systemServices = [
  { name: 'Database', status: 'Online' },
  { name: 'Media Storage', status: 'Online' },
  { name: 'Auth Service', status: 'Online' },
  { name: 'API Gateway', status: 'Online' },
];

const AdminLayout = ({ initialSection = 'overview' }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(initialSection);
  const { logout } = useAuth();

  useEffect(() => {
    setActiveSection(initialSection);
  }, [initialSection]);

  const handleSectionChange = (section) => {
    setActiveSection(section);
    setMenuOpen(false);
  };

  const selectedItem = navItems.find((item) => item.id === activeSection) || navItems[0];

  return (
    <div className={adminLayoutStyles.layout}>
      <div className={adminSidebarStyles.backdrop(menuOpen)} onClick={() => setMenuOpen(false)} />
      <aside className={adminSidebarStyles.sidebar(menuOpen)}>
        <div className={adminSidebarStyles.logoContainer}>
          <div>
            <h1 className="text-xl font-bold text-primary">RealEstate</h1>
            <p className="text-xs text-text-muted">Admin Panel</p>
          </div>
          <button className="md:hidden p-2 rounded-lg hover:bg-gray-100" onClick={() => setMenuOpen(false)}>
            <HiX className="text-xl text-[#475569]" />
          </button>
        </div>

        <nav className={adminSidebarStyles.navContainer}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSectionChange(item.id)}
                className={adminSidebarStyles.navLink(isActive)}
              >
                <Icon className="text-[1.1rem]" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className={adminSidebarStyles.logoutContainer}>
          <button className={adminSidebarStyles.logoutButton} type="button" onClick={logout}>
            <HiLogout className="text-lg" />
            Logout
          </button>
        </div>
      </aside>

      <div className={adminLayoutStyles.mainWrapper}>
        <header className={dashboardNavbarStyles.header}>
          <button className={dashboardNavbarStyles.menuButton} type="button" onClick={() => setMenuOpen(true)}>
            <HiMenu className="text-xl" />
          </button>
          <div className={dashboardNavbarStyles.logoContainer}>
            <span className="font-semibold">Admin Dashboard</span>
          </div>
        </header>

        <main className={adminLayoutStyles.mainContent}>
          {activeSection === 'overview' ? (
            <>
              <div className={adminDashboardStyles.headerContainer}>
                <div>
                  <h1 className={adminDashboardStyles.pageTitle}>Admin Overview</h1>
                  <p className={adminDashboardStyles.pageSubtitle}>
                    Welcome back, administrator. Here's today's summary.
                  </p>
                </div>
                <button type="button" className={adminDashboardStyles.refreshButton} onClick={() => window.location.reload()}>
                  <HiRefresh className="mr-2" /> Refresh Data
                </button>
              </div>

              <div className={adminDashboardStyles.statsGrid}>
                {overviewStats.map((stat) => (
                  <div key={stat.label} className={adminDashboardStyles.statCard}>
                    <div className={`${adminDashboardStyles.statIconContainer} ${stat.accent}`} />
                    <p className={adminDashboardStyles.statTitle}>{stat.label}</p>
                    <p className={adminDashboardStyles.statValue}>{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className={adminDashboardStyles.secondGrid}>
                <section className={adminDashboardStyles.systemHealthCard}>
                  <h2 className={adminDashboardStyles.systemHealthTitle}>System Health</h2>
                  <div className={adminDashboardStyles.servicesContainer}>
                    {systemServices.map((service) => (
                      <div key={service.name} className={adminDashboardStyles.serviceItem}>
                        <div className={adminDashboardStyles.serviceName}>{service.name}</div>
                        <div className={adminDashboardStyles.statusContainer}>
                          <span className={adminDashboardStyles.statusDot} />
                          <span className={adminDashboardStyles.statusText}>{service.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className={adminDashboardStyles.adminToolsCard}>
                  <h2 className={adminDashboardStyles.adminToolsTitle}>Admin Tools</h2>
                  <p className={adminDashboardStyles.adminToolsDesc}>
                    Manage users, review seller approvals, and keep the platform healthy from one place.
                  </p>
                  <div className={adminDashboardStyles.adminToolsButtonsContainer}>
                    <button className={adminDashboardStyles.adminToolButton}>System Logs</button>
                    <button className={adminDashboardStyles.adminToolButton}>DB Backup</button>
                    <button className={adminDashboardStyles.adminToolButton}>Setting</button>
                  </div>
                </section>
              </div>
            </>
          ) : activeSection === 'users' ? (
            <AdminUser />
          ) : activeSection === 'seller-requests' ? (
            <SellerRequest />
          ) : activeSection === 'properties' ? (
            <AdminProperties />
          ) : activeSection === 'inquiries' ? (
            <AdminInquiries />
          ) : activeSection === 'contact' ? (
            <AdminContact />
          ) : (
            <section className="card-premium p-8">
              <div className="flex flex-col gap-2 mb-6">
                <h1 className="text-2xl font-bold text-text-main">{selectedItem.label}</h1>
                <p className="text-text-muted">This section is under active development. Use the sidebar to explore the admin area.</p>
              </div>
              <div className="rounded-3xl border border-[#e2e8f0] bg-[#f8fafc] p-6">
                <p className="text-sm text-[#475569]">
                  The {selectedItem.label.toLowerCase()} section will show detailed management controls here once the backend is connected.
                </p>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
