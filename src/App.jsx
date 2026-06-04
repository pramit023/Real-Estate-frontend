
import React from 'react'
import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/shared/LandingPage';
import Properties from './pages/shared/Properties';
import PropertyDetails from './pages/shared/PropertyDetails';
import Register from './pages/shared/auth/Register';
import VerifyEmail from './pages/shared/auth/verifyEmail';
import Login from './pages/shared/auth/Login';
import ForgotPassword from './pages/shared/auth/ForgotPassword';
import ResetPassword from './pages/shared/auth/ResetPassword';
import Profile from './pages/shared/Profile';
import ChatMessages from './pages/shared/ChatMessages';
import ContactUs from './pages/shared/ContactUs';
import Wishlist from './pages/shared/Wishlist';
import AdminLayout from './components/AdminLayout';
import SellerLayout from './components/SellerLayout';
import ProtectedRoute, { AdminRoute, BuyerRoute, GuestRoute, PublicRoute, SellerRoute } from './components/common/ProtectedRoute';

const App = () => {
  return (
  
   <Routes>
    <Route element={<GuestRoute />}>
      <Route path='/login' element={<Login/>}/>
      <Route path='/register' element={<Register/>}/>
      <Route path='/verify-email' element={<VerifyEmail/>}/>
      <Route path="/forgot-password" element={<ForgotPassword/>}/>
      <Route path="/reset-password/:token" element={<ResetPassword/>}/>
    </Route>

    <Route element={<PublicRoute />}>
      <Route path='/' element={<LandingPage/>}/>
      <Route path='/properties' element={<Properties/>}/>
      <Route path='/property/:id' element={<PropertyDetails/>}/>
    </Route>

    <Route element={<BuyerRoute />}>
      <Route path="/profile" element={<Profile/>} />
      <Route path="/wishlist" element={<Wishlist/>} />
    </Route>

    <Route element={<ProtectedRoute allowedRoles={["buyer","seller"]} />}>
      <Route path="/chat-messages" element={<ChatMessages/>} />
      <Route path="/chat-message" element={<ChatMessages/>} />
      <Route path="/contact" element={<ContactUs/>} />
    </Route>

    <Route element={<SellerRoute />}>
      <Route path="/dashboard" element={<SellerLayout/>} />
      <Route path="/my-properties" element={<SellerLayout initialSection="listings"/>} />
      <Route path="/seller" element={<SellerLayout/>} />
      <Route path="/seller/listings" element={<SellerLayout initialSection="listings"/>} />
      <Route path="/seller/inquiries" element={<SellerLayout initialSection="inquiries"/>} />
      <Route path="/seller/messages" element={<SellerLayout initialSection="messages"/>} />
      <Route path="/seller/profile" element={<SellerLayout initialSection="profile"/>} />
      <Route path="/seller/support" element={<SellerLayout initialSection="support"/>} />
      <Route path="/seller/*" element={<SellerLayout/>} />
    </Route>

    <Route element={<AdminRoute />}>
      <Route path="/admin-dashboard" element={<AdminLayout/>} />
      <Route path="/admin/users" element={<AdminLayout initialSection="users"/>} />
      <Route path="/admin/seller-requests" element={<AdminLayout initialSection="seller-requests"/>} />
      <Route path="/admin/properties" element={<AdminLayout initialSection="properties"/>} />
      <Route path="/admin/inquiries" element={<AdminLayout initialSection="inquiries"/>} />
      <Route path="/admin/contacts" element={<AdminLayout initialSection="contact"/>} />
      <Route path="/admin/contact" element={<AdminLayout initialSection="contact"/>} />
    </Route>
   </Routes>
   
  )
}


export default App
