import React, { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import SideNav from '../SideNav'
import { SidebarProvider, useSidebar } from '../context/SidebarContext'

const DashboardContent = () => {
  const { isCollapsed } = useSidebar()
  const [isDesktop, setIsDesktop] = useState(false)
  
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024)
    }
    
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  const getMarginLeft = () => {
    if (!isDesktop) return '0px'
    return isCollapsed ? '72px' : '256px'
  }
  
  return (
    <div className="min-h-screen bg-[#0f1020] text-white">
      <SideNav />
      <main 
        className="transition-all duration-300 ease-in-out"
        style={{ marginLeft: getMarginLeft() }}
      >
        <Outlet />
      </main>
    </div>
  )
}

const DashboardLayout = () => {
  return (
    <SidebarProvider>
      <DashboardContent />
    </SidebarProvider>
  )
}

export default DashboardLayout