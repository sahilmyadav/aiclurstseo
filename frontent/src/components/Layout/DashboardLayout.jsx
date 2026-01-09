import React, { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import SideNav from '../SideNav'
import { SidebarProvider, useSidebar } from '../context/SidebarContext'
import { useTheme } from '../../context/ThemeContext'
import ThemeToggle from '../ThemeToggle'

const DashboardContent = () => {
  const { isCollapsed } = useSidebar()
  const { theme } = useTheme()
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
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-[#0f1020] text-gray-100' 
        : 'bg-gradient-to-b from-[hsl(250,50%,98%)] to-white min-h-screen'

    }`}>
      <SideNav />
      {/* Theme Toggle in top right */}
      <div className={`fixed top-4 right-4 z-50
    
       p-2 rounded-lg shadow-lg`}
      >
        <ThemeToggle />
      </div>
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