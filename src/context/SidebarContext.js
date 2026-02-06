"use client";

import { createContext, useContext, useState, useEffect } from "react";

const SidebarContext = createContext();

export const SidebarProvider = ({ children }) => {
    const [isCollapsed, setIsCollapsed] = useState(false); // Desktop collapse
    const [isMobileOpen, setIsMobileOpen] = useState(false); // Mobile overlay
    const [isMobile, setIsMobile] = useState(false);

    // Detect screen size
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
            if (window.innerWidth >= 768) {
                setIsMobileOpen(false); // Reset overlay if moving to desktop
            }
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Update CSS variable for Layout adjustment
    useEffect(() => {
        let width;
        if (isMobile) {
            width = '0px'; // Content handles its own padding/width on mobile
        } else {
            width = isCollapsed ? '80px' : '250px';
        }
        document.documentElement.style.setProperty('--sidebar-width', width);
    }, [isCollapsed, isMobile]);

    const toggleCollapse = () => setIsCollapsed(!isCollapsed);
    const toggleMobileSidebar = () => setIsMobileOpen(!isMobileOpen);
    const closeMobileSidebar = () => setIsMobileOpen(false);

    return (
        <SidebarContext.Provider value={{
            isCollapsed,
            isMobileOpen,
            isMobile,
            toggleCollapse,
            toggleMobileSidebar,
            closeMobileSidebar
        }}>
            {children}
        </SidebarContext.Provider>
    );
};

export const useSidebar = () => useContext(SidebarContext);
