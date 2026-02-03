import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Project Media Dashboard",
  description: "Project Management Dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div style={{ display: 'flex' }}>
          <Sidebar />
          <main style={{
            marginLeft: 'var(--sidebar-width)',
            flex: 1,
            padding: '25px 40px',
            minHeight: '100vh',
            backgroundColor: 'var(--background-color)'
          }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
