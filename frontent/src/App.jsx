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

const AppContent = () => {
  const location = useLocation()
  const isDashboardRoute = location.pathname.startsWith('/dashboard')
  // const isReviewRoute = location.pathname.startsWith('/review')

  return (
    <>
      {!isDashboardRoute  && <Navbar />}
      <Toaster richColors position="top-center" />

      <Routes>
         <Route path="/" element={
          <>
            <Home />
            <Features />
          </>
        } />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/review/:locationId" element={<MakeReview />} />
        <Route path="/analytics-dashboard" element={<AnalyticsDashboard />} />
        <Route path="/seo-dashboard" element={<SeoDashboard />} />
          <Route path="/reviews" element={<Allreviews />} />


        <Route path='/dashboard' element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="reviews" element={<InboxMessage />} />
          <Route path="audit" element={<Audit />} />
          <Route path="review-link" element={<ReviewLink />} />
          <Route path="widgets" element={<WebsiteWidgets />} />
          <Route path="integrations" element={<Integrations />} />
          <Route path="social-sharing" element={<Posts/>} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="settings" element={<Settings />} />
        </Route>
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