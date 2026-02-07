"use client";

import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import ChatWidget from "@/components/chat/ChatWidget";
import { useEffect } from "react";

export default function LayoutWrapper({ children }) {
    const pathname = usePathname();
    const isLoginPage = pathname === "/";
    const router = useRouter();

    useEffect(() => {
        if (isLoginPage) return;

        const validateSession = async () => {
            const { getSession, clearSession } = require("@/lib/auth");
            const session = getSession();

            if (!session) return; // If no session, wait for redirect or manual login

            try {
                const res = await fetch('/api/auth/validate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: session.id,
                        tokenVersion: session.tokenVersion || 0 // Default to 0 if missing (forces logout)
                    })
                });

                const data = await res.json();
                if (!data.valid) {
                    console.log("Session invalid (Token Version Mismatch). Logging out...");
                    clearSession();
                    router.push('/');
                }
            } catch (e) {
                console.error("Session validation failed", e);
            }
        };

        // Validate on mount
        validateSession();

        // Validate every 5 minutes
        const interval = setInterval(validateSession, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, [pathname, isLoginPage]);

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
