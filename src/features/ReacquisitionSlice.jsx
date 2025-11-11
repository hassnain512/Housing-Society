// features/ReacquisitionSlice.jsx
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  list: [], // { id, plotId, plotNumber, block, ownerId, ownerName, ownerCnic, price, paymentMode, receiptFile (base64), remarks, status, createdAt }
};

const reacquisitionSlice = createSlice({
  name: "reacquisition",
  initialState,
  reducers: {
    addReacquisition: (state, action) => {
      state.list.unshift(action.payload);
    },
    updateReacquisition: (state, action) => {
      const { id, updatedData } = action.payload;
      const idx = state.list.findIndex((r) => r.id === id);
      if (idx !== -1) state.list[idx] = { ...state.list[idx], ...updatedData };
    },
    removeReacquisition: (state, action) => {
      state.list = state.list.filter((r) => r.id !== action.payload);
    },
    setStatus: (state, action) => {
      const { id, status } = action.payload;
      const idx = state.list.findIndex((r) => r.id === id);
      if (idx !== -1) state.list[idx].status = status;
    },
  },
});

export const {
  addReacquisition,
  updateReacquisition,
  removeReacquisition,
  setStatus,
} = reacquisitionSlice.actions;
export default reacquisitionSlice.reducer;
