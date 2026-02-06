"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearSession } from "@/lib/auth";
import {
  LayoutDashboard, FileSearch, PenTool, Mic, Palette, Users,
  LogOut, ChevronLeft, ChevronRight, X
} from "lucide-react";
import Logo from "./Logo";
import styles from "./Sidebar.module.css";
import { useSidebar } from "@/context/SidebarContext";

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { isCollapsed, toggleCollapse, isMobile, isMobileOpen, closeMobileSidebar } = useSidebar();
  const [user, setUser] = useState(null);

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    clearSession();
    router.push('/');
  };

  useEffect(() => {
    const session = localStorage.getItem('user_session');
    if (session) {
      setUser(JSON.parse(session));
    }
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    if (isMobile) closeMobileSidebar();
  }, [pathname, isMobile]);

  const allMenuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { name: "Research Dep", icon: FileSearch, path: "/research", key: "research" },
    { name: "Writer Dep", icon: PenTool, path: "/writer", key: "writer" },
    { name: "Speaker Dep", icon: Mic, path: "/speaker", key: "speaker" },
    { name: "Graphics Dep", icon: Palette, path: "/graphics", key: "graphics" },
  ];

  const menuItems = allMenuItems.filter(item => {
    if (!user) return false;
    if (user.role === 'main_team') return true;
    if (item.path === '/dashboard') return false;
    let userDeps = [];
    if (user.departments) {
      try {
        const parsed = JSON.parse(user.departments);
        userDeps = Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        userDeps = user.departments.split(',').map(d => d.trim());
      }
    }
    userDeps = userDeps.map(d => d.toLowerCase());
    if (item.key && userDeps.includes(item.key)) return true;
    return false;
  });

  const generalItems = [
    { name: "Members", icon: Users, path: "/members" },
  ].filter(item => {
    if (!user) return false;
    if (item.path === '/members' && user.role !== 'main_team') return false;
    return true;
  });

  // Determine Sidebar Classes
  // Desktop: .sidebar + (isCollapsed ? .collapsed : '')
  // Mobile: .sidebar + .mobile + (isMobileOpen ? .open : '')
  const sidebarClasses = `
    ${styles.sidebar} 
    ${isMobile ? styles.mobile : ''} 
    ${isMobile && isMobileOpen ? styles.open : ''} 
    ${!isMobile && isCollapsed ? styles.collapsed : ''}
  `;

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isMobileOpen && (
        <div className={styles.overlay} onClick={closeMobileSidebar} />
      )}

      <aside className={sidebarClasses}>
        <div className={styles.logoContainer}>
          {/* On mobile, show close button instead of simple logo sometimes? Or simple layout */}
          <div className={styles.logoIconWrapper}>
            <Logo size={40} />
          </div>
          {/* Show text if NOT collapsed OR if is Mobile */}
          {(!isCollapsed || isMobile) && <span className={styles.logoText}>MEDIA</span>}

          {/* Mobile Close Button */}
          {isMobile && (
            <button onClick={closeMobileSidebar} className={styles.mobileCloseBtn}>
              <X size={24} />
            </button>
          )}
        </div>

        <div className={styles.menuSection}>
          <h3 className={styles.menuTitle}>MENU</h3>
          <nav className={styles.nav}>
            {menuItems.map((item) => {
              const isActive = pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  href={item.path}
                  key={item.name}
                  className={`${styles.navItem} ${isActive ? styles.active : ""}`}
                  title={isCollapsed && !isMobile ? item.name : ''}
                >
                  <div className={styles.iconWrapper}><Icon size={20} /></div>
                  <span className={styles.navText}>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className={styles.menuSection}>
          <h3 className={styles.menuTitle}>GENERAL</h3>
          <nav className={styles.nav}>
            {generalItems.map((item) => {
              const isActive = pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  href={item.path}
                  key={item.name}
                  className={`${styles.navItem} ${isActive ? styles.active : ""}`}
                  title={isCollapsed && !isMobile ? item.name : ''}
                >
                  <div className={styles.iconWrapper}><Icon size={20} /></div>
                  <span className={styles.navText}>{item.name}</span>
                </Link>
              );
            })}

            <div className={styles.logoutRow}>
              <button
                className={`${styles.navItem} ${styles.logoutBtn}`}
                onClick={handleLogout}
                title={isCollapsed && !isMobile ? "Logout" : ''}
              >
                <div className={styles.iconWrapper}><LogOut size={20} /></div>
                <span className={styles.navText}>Logout</span>
              </button>

              {/* Desktop Toggle Button - Hidden on Mobile */}
              {!isMobile && (
                <button className={styles.toggleBtn} onClick={toggleCollapse} title="Toggle Sidebar">
                  {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>
              )}
            </div>
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
