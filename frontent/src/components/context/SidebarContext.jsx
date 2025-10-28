import React, { createContext, useContext, useState, useCallback } from 'react';

const SidebarContext = createContext(null);
export const useSidebar = () => useContext(SidebarContext);

export const SidebarProvider = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleSidebar = useCallback(() => setIsCollapsed((v) => !v), []);
  const toggleMobileSidebar = useCallback(() => setMobileOpen((v) => !v), []);
  const closeMobileSidebar = useCallback(() => setMobileOpen(false), []);

  const value = {
    isCollapsed,
    mobileOpen,
    toggleSidebar,
    toggleMobileSidebar,
    closeMobileSidebar,
    setMobileOpen,
  };

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
};
