import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Project Media Dashboard",
  description: "Project Management Dashboard",
};

import StoreProvider from "./StoreProvider";

import LayoutWrapper from "@/components/LayoutWrapper";
import { ChatProvider } from "@/context/ChatContext";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <StoreProvider>
          <ChatProvider>
            <LayoutWrapper>
              {children}
            </LayoutWrapper>
          </ChatProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
