import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";

import "./index.css";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import Dashboard from "../src/pages/Dashboard.jsx";
import Customers from "../src/pages/Customers.jsx";
import Booking from "../src/pages/Booking.jsx";
import Installments from "../src/pages/Installments.jsx";
import Plans from "../src/pages/Plans.jsx";
import Reports from "../src/pages/Reports.jsx";
import Settings from "../src/pages/Settings.jsx";
import MapView from "../src/pages/MapView.jsx";
import ReAcquisition from "../src/pages/ReAcquisition.jsx";
import Plots from "../src/pages/Plots.jsx";
import Layout from "./layout/Layout.jsx";
import BlockPlots from "../src/components/BlockPlots.jsx";
import { Provider } from "react-redux";
import { store } from "./features/Store.jsx";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route path="/" element={<Dashboard />} />
      <Route path="/booking" element={<Booking />} />
      <Route path="/installments" element={<Installments />} />
      <Route path="/plans" element={<Plans />} />
      <Route path="/plots" element={<Plots />} />
      <Route path="/plots/block/:block" element={<BlockPlots />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/customers" element={<Customers />} />
      <Route path="/map" element={<MapView />} />
      <Route path="/reacquisition" element={<ReAcquisition />} />
    </Route>
  )
);

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <Toaster position="top-right" reverseOrder={false} />

    <RouterProvider router={router} />
  </Provider>
);
