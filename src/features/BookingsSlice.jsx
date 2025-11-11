import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  list: [], // stores all bookings
};

const bookingsSlice = createSlice({
  name: "bookings",
  initialState,
  reducers: {
    addBooking: (state, action) => {
      state.list.push(action.payload);
    },
    updateBooking: (state, action) => {
      const { id, updatedData } = action.payload;
      const index = state.list.findIndex(b => b.id === id);
      if (index !== -1) {
        state.list[index] = { ...state.list[index], ...updatedData };
      }
    },
    deleteBooking: (state, action) => {
      state.list = state.list.filter(b => b.id !== action.payload);
    },
    clearBookings: (state) => {
      state.list = [];
    }
  }
});

export const { addBooking, updateBooking, deleteBooking, clearBookings } = bookingsSlice.actions;

export default bookingsSlice.reducer;
