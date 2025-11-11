// features/SettingsSlice.jsx
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  societyName: "My Society",
  logo: null, // base64
  admin: { name: "", email: "" },
  blocks: ["A", "B", "C"],
  categories: ["Residential", "Commercial"],
  paymentPlans: ["Monthly", "Quarterly", "Yearly"],
  roles: ["Admin", "Manager"],
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    updateSettings(state, action) {
      return { ...state, ...action.payload };
    },
    addBlock(state, action) {
      if (!state.blocks.includes(action.payload)) state.blocks.push(action.payload);
    },
    removeBlock(state, action) {
      state.blocks = state.blocks.filter(b => b !== action.payload);
    },
    setLogo(state, action) {
      state.logo = action.payload;
    }
  }
});

export const { updateSettings, addBlock, removeBlock, setLogo } = settingsSlice.actions;
export default settingsSlice.reducer;
