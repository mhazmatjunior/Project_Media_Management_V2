"use client";

import { createContext, useContext, useState } from "react";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeChat, setActiveChat] = useState(null); // { type: 'group'|'dm', id: string|int, name: string }
    const [totalUnread, setTotalUnread] = useState(0);

    const toggleChat = () => {
        setIsOpen((prev) => !prev);
    };

    const openChat = (chat) => {
        setActiveChat(chat);
        setIsOpen(true);
    };

    const closeChat = () => {
        setIsOpen(false);
    }

    return (
        <ChatContext.Provider value={{ isOpen, toggleChat, openChat, closeChat, activeChat, setActiveChat, totalUnread, setTotalUnread }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => useContext(ChatContext);
