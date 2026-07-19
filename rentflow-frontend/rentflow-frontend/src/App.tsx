import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import RoleRoute from '@/components/common/RoleRoute'

import Landing from '@/pages/Landing'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import Forbidden from '@/pages/Forbidden'
import NotFound from '@/pages/NotFound'
import PendingApproval from '@/pages/PendingApproval'

import UserDashboard from '@/pages/user/UserDashboard'
import Profile from '@/pages/user/Profile'
import BrowseRentals from '@/pages/user/BrowseRentals'
import MyRentals from '@/pages/user/MyRentals'
import ProductDetails from '@/pages/user/ProductDetails'
import Cart from '@/pages/user/Cart'
import Checkout from '@/pages/user/Checkout'
import OrderSuccess from '@/pages/user/OrderSuccess'

import AdminDashboard from '@/pages/admin/AdminDashboard'
import UserManagement from '@/pages/admin/UserManagement'
import Configuration from '@/pages/admin/Configuration'
import VendorApprovals from '@/pages/admin/VendorApprovals'
import BookingsManagement from '@/pages/admin/BookingsManagement'
import PlaceholderSection from '@/pages/admin/PlaceholderSection'

import VendorDashboard from '@/pages/vendor/VendorDashboard'
import VendorBookings from '@/pages/vendor/VendorBookings'
import VendorEquipment from '@/pages/vendor/VendorEquipment'
import VendorEarnings from '@/pages/vendor/VendorEarnings'

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/pending-approval" element={<PendingApproval />} />
      <Route path="/403" element={<Forbidden />} />

      {/* Standard User portal */}
      <Route
        path="/dashboard"
        element={
          <RoleRoute allow={['user', 'admin']}>
            <UserDashboard />
          </RoleRoute>
        }
      />
      <Route
        path="/browse"
        element={
          <RoleRoute allow={['user', 'admin']}>
            <BrowseRentals />
          </RoleRoute>
        }
      />
      <Route
        path="/my-rentals"
        element={
          <RoleRoute allow={['user', 'admin']}>
            <MyRentals />
          </RoleRoute>
        }
      />
      <Route
        path="/product/:id"
        element={
          <RoleRoute allow={['user', 'admin']}>
            <ProductDetails />
          </RoleRoute>
        }
      />
      <Route
        path="/cart"
        element={
          <RoleRoute allow={['user', 'admin']}>
            <Cart />
          </RoleRoute>
        }
      />
      <Route
        path="/checkout"
        element={
          <RoleRoute allow={['user', 'admin']}>
            <Checkout />
          </RoleRoute>
        }
      />
      <Route
        path="/my-rentals"
        element={
          <RoleRoute allow={['user', 'admin']}>
            <MyRentals />
          </RoleRoute>
        }
      />
      <Route
        path="/order-success/:id"
        element={
          <RoleRoute allow={['user', 'admin']}>
            <OrderSuccess />
          </RoleRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <RoleRoute allow={['user', 'admin']}>
            <Profile />
          </RoleRoute>
        }
      />

      {/* Administrator portal */}
      <Route
        path="/admin"
        element={
          <RoleRoute allow={['admin', 'vendor']}>
            <AdminDashboard />
          </RoleRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <RoleRoute allow={['admin']}>
            <UserManagement />
          </RoleRoute>
        }
      />
      <Route
        path="/admin/vendors"
        element={
          <RoleRoute allow={['admin']}>
            <VendorApprovals />
          </RoleRoute>
        }
      />
      <Route
        path="/admin/bookings"
        element={
          <RoleRoute allow={['admin', 'vendor']}>
            <BookingsManagement />
          </RoleRoute>
        }
      />
      <Route
        path="/admin/configuration"
        element={
          <RoleRoute allow={['admin']}>
            <Configuration />
          </RoleRoute>
        }
      />
      <Route
        path="/admin/logistics"
        element={
          <RoleRoute allow={['admin']}>
            <PlaceholderSection
              title="Logistics"
              description="Fleet, pickup, and delivery scheduling across branches."
            />
          </RoleRoute>
        }
      />
      <Route
        path="/admin/finance"
        element={
          <RoleRoute allow={['admin']}>
            <PlaceholderSection
              title="Finance"
              description="Invoices, payouts, and revenue reporting."
            />
          </RoleRoute>
        }
      />

      {/* Vendor portal */}
      <Route
        path="/vendor"
        element={
          <RoleRoute allow={['vendor', 'admin']}>
            <VendorDashboard />
          </RoleRoute>
        }
      />
      <Route
        path="/vendor/bookings"
        element={
          <RoleRoute allow={['vendor', 'admin']}>
            <VendorBookings />
          </RoleRoute>
        }
      />
      <Route
        path="/vendor/equipment"
        element={
          <RoleRoute allow={['vendor', 'admin']}>
            <VendorEquipment />
          </RoleRoute>
        }
      />
      <Route
        path="/vendor/earnings"
        element={
          <RoleRoute allow={['vendor', 'admin']}>
            <VendorEarnings />
          </RoleRoute>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

import { CartProvider } from '@/context/CartContext'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppRoutes />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
