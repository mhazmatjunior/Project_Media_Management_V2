import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Project Media Dashboard",
  description: "Project Management Dashboard",
};

import StoreProvider from "./StoreProvider";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <StoreProvider>
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
          </div>
        </StoreProvider>
      </body>
    </html>
  );
}
