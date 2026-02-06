"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import ChatWidget from "@/components/chat/ChatWidget";

export default function LayoutWrapper({ children }) {
    const pathname = usePathname();
    const isLoginPage = pathname === "/";

    if (isLoginPage) {
        return <main style={{ backgroundColor: 'var(--background-color)', minHeight: '100vh' }}>{children}</main>;
    }

    return (
        <div style={{ display: 'flex' }}>
            <Sidebar />
            <main style={{
                marginLeft: 'var(--sidebar-width)',
                flex: 1,
                padding: '0 40px',
                minHeight: '100vh',
                backgroundColor: 'var(--background-color)'
            }}>
                {children}
            </main>
            <ChatWidget />
        </div>
    );
}
