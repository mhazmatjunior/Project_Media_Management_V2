"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearSession } from "@/lib/auth";
import {
  LayoutDashboard, FileSearch, PenTool, Mic, Palette, Users,
  LogOut, ChevronLeft, ChevronRight
} from "lucide-react";
import Logo from "./Logo";
import styles from "./Sidebar.module.css";

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const width = isCollapsed ? '80px' : '250px';
    document.documentElement.style.setProperty('--sidebar-width', width);
  }, [isCollapsed]);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const handleLogout = async () => {
    // Call logout API to clear cookie
    await fetch('/api/logout', { method: 'POST' });
    // Clear localStorage
    clearSession();
    // Redirect to login
    router.push('/');
  };

  const [user, setUser] = useState(null);

  useEffect(() => {
    // get user from localstorage
    const session = localStorage.getItem('user_session');
    if (session) {
      setUser(JSON.parse(session));
    }
  }, []);

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

    // For non-main team
    if (item.path === '/dashboard') return false;

    // Check departments
    let userDeps = [];
    if (user.departments) {
      try {
        const parsed = JSON.parse(user.departments);
        userDeps = Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        userDeps = user.departments.split(',').map(d => d.trim());
      }
    }

    // Normalize to lowercase
    userDeps = userDeps.map(d => d.toLowerCase());

    // Only show if user has this department
    if (item.key && userDeps.includes(item.key)) return true;

    return false;
  });

  const generalItems = [
    { name: "Members", icon: Users, path: "/members" },
  ];

  return (
    <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
      <div className={styles.logoContainer}>
        <div className={styles.logoIconWrapper}>
          <Logo size={40} />
        </div>
        <span className={styles.logoText}>MEDIA</span>
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
                title={isCollapsed ? item.name : ''}
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
                title={isCollapsed ? item.name : ''}
              >
                <div className={styles.iconWrapper}><Icon size={20} /></div>
                <span className={styles.navText}>{item.name}</span>
              </Link>
            );
          })}

          {/* Logout Row with Toggle Button */}
          <div className={styles.logoutRow}>
            <button
              className={`${styles.navItem} ${styles.logoutBtn}`}
              onClick={handleLogout}
              title={isCollapsed ? "Logout" : ''}
            >
              <div className={styles.iconWrapper}><LogOut size={20} /></div>
              <span className={styles.navText}>Logout</span>
            </button>

            {/* The Toggle Symbol */}
            <button className={styles.toggleBtn} onClick={toggleSidebar} title="Toggle Sidebar">
              {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          </div>

        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
