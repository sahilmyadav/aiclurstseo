import React from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { AuthContextProvider } from './components/context/AuthContext'
import Navbar from './components/common/Navbar'
import Home from './components/common/Home'
import Login from './components/Auth/Login'
import Signup from './components/Auth/Signup'
import Dashboard from './components/Dashboard'
import DashboardLayout from './components/Layout/DashboardLayout'
import { Toaster } from 'sonner'
import Allreviews from './components/Allreviews'
import SeoDashboard from './components/Seo-Dashboard'
import Settings from './components/Settings'
import AnalyticsDashboard from './components/Analytics-Dashboard'
import Integrations from './components/Integrations'
import Audit from './components/Audit'
import ReviewLink from './components/ReviewLink'
import SocialSharing from './components/SocialSharing'
import Notifications from './components/Notifications'
// import { GoogleBusinessProvider } from './components/context/GoogleBusinessContext'
import InboxMessage from './components/Get-Reviews'
import MakeReview from './pages/MakeReview'
import Posts from './components/Posts'
import WebsiteWidgets from './components/Widget'
import Features from './components/Features'
import { Navigate } from 'react-router-dom'
import { useAuth } from './components/context/AuthContext'
import AdminDashboard from './components/admin/AdminDashboard'
import { Users } from 'lucide-react'
import AllUsers from './components/admin/AllUsers'
import Reviews from './components/Reviews'
import SubscriptionPage from './components/subscription/SubscriptionPage'


const AppContent = () => {
  const location = useLocation()
  const isDashboardRoute = location.pathname.startsWith('/dashboard')
  const { isAuthenticated, user, isLoading, isInitialized } = useAuth()

  // Show loading state while checking authentication
  if (isLoading || !isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      {!isDashboardRoute && <Navbar />}
      <Toaster richColors position="top-center" />

      <Routes>
        <Route path="/" element={
          <>
            <Home />
            <Features />
          </>
        } />
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/signup" element={!isAuthenticated ? <Signup /> : <Navigate to="/dashboard" />} />
        <Route path="/review/:locationId" element={<MakeReview />} />
        <Route path="/analytics-dashboard" element={isAuthenticated ? <AnalyticsDashboard /> : <Navigate to="/login" />} />
        <Route path="/seo-dashboard" element={isAuthenticated ? <SeoDashboard /> : <Navigate to="/login" />} />
        <Route path="/reviews" element={isAuthenticated ? <Allreviews /> : <Navigate to="/login" />} />


        {
          isAuthenticated && user.role !== 'admin' &&
          <Route
            path="/dashboard"
            element={<DashboardLayout />}
          >
            <Route index element={<Dashboard />} />
            <Route path="reviews" element={<InboxMessage />} />
            <Route path="handle-reviews" element={<Reviews />} />
            <Route path="audit" element={<Audit />} />
            <Route path="review-link" element={<ReviewLink />} />
            <Route path="widgets" element={<WebsiteWidgets />} />
            <Route path="integrations" element={<Integrations />} />
            <Route path="social-sharing" element={<Posts />} />
            <Route path="schedule-post" element={<SocialSharing />} />
            <Route path="subscription" element={<SubscriptionPage />} />
            
            <Route path="notifications" element={<Notifications />} />
            <Route path="settings" element={<Settings />} />
          </Route>

        }


        {
          isAuthenticated && user.role === 'admin' &&
          <Route
            path='/dashboard'
            element={<DashboardLayout />}
          >
            <Route index element={<AdminDashboard />} />
            <Route path="settings" element={<Settings />} />
            <Route path="users" element={<AllUsers />} />
            <Route path="analytics" element={<AnalyticsDashboard />} />


          </Route>
        }
        {/* 


      
        {/* Catch-all route for non-existent paths */}
        {/* Only handle 404 redirects after auth is initialized */}
        <Route 
          path="*" 
          element={
            isInitialized ? (
              <Navigate to={isAuthenticated ? "/dashboard" : "/"} replace />
            ) : null
          } 
        />
      </Routes>
    </>
  )
}

const App = () => {
  return (
    <AuthContextProvider>
      <AppContent />
    </AuthContextProvider>
  )
}

export default App