import { createSlice } from "@reduxjs/toolkit";

// This is the starting data in Redux when the application opens.
const initialState = {
  user: null,       // Administrator details from the backend
  loading: true,     // True while we check whether the admin is already logged in
};

const UserSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // Save the latest authentication information in Redux.
    // We send the complete object through action.payload.
    addCase: (state, action) => {
      return action.payload;
    },
  },
});

export const { addCase } = UserSlice.actions;
export default UserSlice.reducer;
