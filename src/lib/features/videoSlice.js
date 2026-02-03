import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    videos: [
        // Ended
        { id: 1, name: "Q3 Marketing Video", status: 'ended', date: "Nov 10", color: "#3B82F6", value: 30 },
        { id: 2, name: "Product Launch Teaser", status: 'ended', date: "Nov 15", color: "#10B981", value: 45 },
        { id: 3, name: "Tutorial Series Ep.1", status: 'ended', date: "Nov 20", color: "#F59E0B", value: 60 },

        // Running
        { id: 4, name: "Holiday Promo 2024", status: 'running', date: "Dec 20", color: "#EF4444", value: 70 },
        { id: 5, name: "CEO Interview Edit", status: 'running', date: "Dec 22", color: "#8B5CF6", value: 40 },
        { id: 6, name: "Website Background Loop", status: 'running', date: "Dec 25", color: "#EC4899", value: 50 },
        { id: 7, name: "Social Media Shorts", status: 'running', date: "Dec 28", color: "#14B8A6", value: 65 },

        // Pending
        { id: 8, name: "Concept Art Review", status: 'pending', description: "Waiting for feedback", color: "#6366F1", value: 0 },
        { id: 9, name: "Script Approval", status: 'pending', description: "Pending CEO review", color: "#8B5CF6", value: 0 },
    ],
};

const videoSlice = createSlice({
    name: 'videos',
    initialState,
    reducers: {
        addVideo: (state, action) => {
            state.videos.push({
                id: Date.now(),
                status: 'pending',
                value: 0, // Initial progress value
                color: "var(--primary-color)",
                ...action.payload,
            });
        },
        updateVideoStatus: (state, action) => {
            const { id, status } = action.payload;
            const video = state.videos.find(v => v.id === id);
            if (video) {
                video.status = status;
            }
        },
    },
});

export const { addVideo, updateVideoStatus } = videoSlice.actions;
export default videoSlice.reducer;
