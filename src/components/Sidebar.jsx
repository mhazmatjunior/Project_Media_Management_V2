"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, FileSearch, PenTool, Mic, Palette, Settings,
  HelpCircle, LogOut, ChevronLeft, ChevronRight
} from "lucide-react";
import Logo from "./Logo";
import styles from "./Sidebar.module.css";

const Sidebar = () => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const width = isCollapsed ? '80px' : '250px';
    document.documentElement.style.setProperty('--sidebar-width', width);
  }, [isCollapsed]);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/" },
    { name: "Research Dep", icon: FileSearch, path: "/research" },
    { name: "Writer Dep", icon: PenTool, path: "/writer" },
    { name: "Speaker Dep", icon: Mic, path: "/speaker" },
    { name: "Graphics Dep", icon: Palette, path: "/graphics" },
  ];

  const generalItems = [
    { name: "Settings", icon: Settings, path: "/settings" },
    { name: "Help", icon: HelpCircle, path: "/help" },
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
