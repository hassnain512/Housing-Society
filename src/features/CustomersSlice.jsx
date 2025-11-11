// src/features/customers/customersSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialCustomers = [
  {
    id: Date.now(),
    fullName: "Ali Khan",
    fatherOrSpouse: "Muhammad Khan",
    cnic: "35202-XXXXX-1",
    phone: "0312-XXXXXXX",
    email: "ali.khan@example.com",
    address: "Gujranwala",
    nextOfKin: { name: "Sara Khan", cnic: "35202-YYYYY-2", phone: "0300-XXXXXXX" },
  },
];

export const customersSlice = createSlice({
  name: "customers",
  initialState: {
    list: initialCustomers,
  },
  reducers: {
    addCustomer: (state, action) => {
      state.list.unshift(action.payload);
    },
    deleteCustomer: (state, action) => {
      state.list = state.list.filter(c => c.id !== action.payload);
    },
    updateCustomer: (state, action) => {
      const { id, updatedData } = action.payload;
      const index = state.list.findIndex(c => c.id === id);
      if (index !== -1) {
        state.list[index] = {
          ...state.list[index],
          ...updatedData,
          nextOfKin: {
            ...state.list[index].nextOfKin,
            ...updatedData.nextOfKin,
          },
        };
      }
    }
  },
});

export const { addCustomer, deleteCustomer, updateCustomer } = customersSlice.actions;
export default customersSlice.reducer;
