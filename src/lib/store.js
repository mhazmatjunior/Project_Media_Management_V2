import { configureStore } from '@reduxjs/toolkit';
import videoReducer from './features/videoSlice';

export const makeStore = () => {
    return configureStore({
        reducer: {
            videos: videoReducer,
        },
    });
};
