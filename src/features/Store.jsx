// src/app/store.js
import { configureStore } from "@reduxjs/toolkit";
import CustomersReducer from "./CustomersSlice.jsx";
import bookingsReducer from "./BookingsSlice.jsx";
import settingsReducer from "./SettingsSlice.jsx";
import reacquisitionReducer from "./ReacquisitionSlice.jsx";
import plotsReducer from "./PlotsSlice.jsx";

export const store = configureStore({
  reducer: {
    customers: CustomersReducer,
    plots: plotsReducer,
    bookings: bookingsReducer,
    settings: settingsReducer,
    reacquisition: reacquisitionReducer,
  },
});
