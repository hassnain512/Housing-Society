// src/redux/plotsSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  plots: [],
};

const plotsSlice = createSlice({
  name: "plots",
  initialState,
  reducers: {
    addPlot: (state, action) => {
      state.plots.push(action.payload);
    },
    removePlot: (state, action) => {
      state.plots = state.plots.filter(
        (_, index) => index !== action.payload
      );
    },
    updatePlot: (state, action) => {
      const { index, data } = action.payload;
      if (state.plots[index]) {
        state.plots[index] = { ...state.plots[index], ...data };
      }
    },
    clearPlots: (state) => {
      state.plots = [];
    },
  },
});

export const { addPlot, removePlot, updatePlot, clearPlots } = plotsSlice.actions;
export default plotsSlice.reducer;
