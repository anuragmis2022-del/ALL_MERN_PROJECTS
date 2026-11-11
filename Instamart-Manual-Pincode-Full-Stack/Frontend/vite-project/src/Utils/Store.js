import { configureStore } from "@reduxjs/toolkit";
import userSliceReducer from "./UserSlice";

// The store is the central place where our shared data is kept.
export const Store = configureStore({
  reducer: {
    user: userSliceReducer,
  },
});
