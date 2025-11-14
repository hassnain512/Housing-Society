import React, { useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import toast, { Toaster } from "react-hot-toast";
import { MdCheck, MdDelete, MdEdit, MdClose } from "react-icons/md";
import {
  addBooking,
  updateBooking,
  deleteBooking,
} from "../features/BookingsSlice.jsx";
import { updatePlot } from "../features/PlotsSlice.jsx";

export default function BookingPage() {
  const dispatch = useDispatch();
  const customers = useSelector((state) => state.customers.list ?? []);
  const plots = useSelector((state) => state.plots.plots ?? []);
  const bookings = useSelector((state) => state.bookings.list ?? []);

  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedBlockId, setSelectedBlockId] = useState("");
  const [selectedPlotId, setSelectedPlotId] = useState("");
  const [searchCustomer, setSearchCustomer] = useState("");
  const [editBookingId, setEditBookingId] = useState(null);
  const [editingBooking, setEditingBooking] = useState(null);

  // Get unique blocks
  const uniqueBlocks = [...new Set(plots.map((p) => p.block))];

  const filteredCustomers = useMemo(
    () =>
      customers.filter(
        (c) =>
          c.fullName.toLowerCase().includes(searchCustomer.toLowerCase()) ||
          c.cnic.includes(searchCustomer)
      ),
    [customers, searchCustomer]
  );

  const filteredPlots = useMemo(
    () =>
      plots.filter(
        (p) =>
          p.status === "Available" &&
          (selectedBlockId ? p.block === selectedBlockId : true)
      ),
    [plots, selectedBlockId]
  );

  const selectedCustomer = customers.find(
    (c) => c.id === Number(selectedCustomerId)
  );
  const selectedPlot = plots.find((p) => p.id === Number(selectedPlotId));

  const handleBooking = () => {
    if (!selectedCustomer || !selectedPlot) {
      toast.error("Please select both a customer and a plot.");
      return;
    }

    // Check if customer already has a booking
    const existingBooking = bookings.find(
      (b) => b.customerId === selectedCustomer.id && !editBookingId
    );
    if (existingBooking) {
      toast.error("This customer already has an active booking.");
      return;
    }

    const bookingData = {
      id: editBookingId || Date.now(),
      customerId: selectedCustomer.id,
      plotId: selectedPlot.id,
      customerName: selectedCustomer.fullName,
      customerCnic: selectedCustomer.cnic,
      customerPhone: selectedCustomer.phone,
      plotNumber: selectedPlot.plotNumber,
      block: selectedPlot.block,
      size: selectedPlot.size,
      price: selectedPlot.price,
      category: selectedPlot.category,
      status: "Booked",
      bookingDate: new Date().toLocaleDateString(),
    };

    if (editBookingId) {
      // Revert old plot status
      const oldBooking = bookings.find((b) => b.id === editBookingId);
      if (oldBooking) {
        const oldPlotIndex = plots.findIndex((p) => p.id === oldBooking.plotId);
        if (oldPlotIndex !== -1) {
          dispatch(
            updatePlot({
              index: oldPlotIndex,
              data: { ...plots[oldPlotIndex], status: "Available" },
            })
          );
        }
      }
      dispatch(updateBooking({ id: editBookingId, updatedData: bookingData }));
      toast.success("Booking updated successfully!");
      setEditBookingId(null);
      setEditingBooking(null);
    } else {
      dispatch(addBooking(bookingData));
      toast.success("Plot booked successfully!");
    }

    // Update plot status to Booked
    const plotIndex = plots.findIndex((p) => p.id === selectedPlot.id);
    if (plotIndex !== -1) {
      dispatch(
        updatePlot({
          index: plotIndex,
          data: { ...plots[plotIndex], status: "Booked" },
        })
      );
    } else {
      toast.error("Could not update plot status. Please try again.");
    }

    resetForm();
  };

  const resetForm = () => {
    setSelectedCustomerId("");
    setSelectedBlockId("");
    setSelectedPlotId("");
    setSearchCustomer("");
    setEditBookingId(null);
    setEditingBooking(null);
  };

  const handleEditBooking = (b) => {
    setEditingBooking(b);
    setEditBookingId(b.id);
    setSelectedCustomerId(b.customerId.toString());
    const plot = plots.find((p) => p.id === b.plotId);
    if (plot) {
      setSelectedBlockId(plot.block);
    }
    setSelectedPlotId(b.plotId.toString());
  };

  const handleDeleteBooking = (id) => {
    const booking = bookings.find((b) => b.id === id);
    if (!booking) return;

    // Reset plot status
    const plotIndex = plots.findIndex((p) => p.id === booking.plotId);
    if (plotIndex !== -1) {
      dispatch(
        updatePlot({
          index: plotIndex,
          data: { ...plots[plotIndex], status: "Available" },
        })
      );
    }

    dispatch(deleteBooking(id));
    toast.success("Booking deleted successfully!");
  };

  return (
    <div className="p-6">
      <Toaster position="top-right" />
      <h2 className="text-2xl font-bold text-slate-800 mb-6">
      Booking Management
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Customers */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-indigo-600 rounded-full"></span>Select
            Customer
          </h3>
          <input
            type="text"
            placeholder="Search by name or CNIC..."
            value={searchCustomer}
            onChange={(e) => setSearchCustomer(e.target.value)}
            className="border border-gray-300 w-full p-3 rounded-lg mb-3 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
          />
          <select
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            className="border border-gray-300 w-full p-3 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
          >
            <option value="">-- Select Customer --</option>
            {filteredCustomers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.fullName} • {c.cnic}
              </option>
            ))}
          </select>
          {selectedCustomer && (
            <div className="bg-linear-to-br from-blue-50 to-indigo-50 p-4 rounded-lg mt-4 border border-blue-200">
              <p className="text-sm mb-2">
                <b className="text-slate-700">Name:</b>{" "}
                <span className="text-slate-600">
                  {selectedCustomer.fullName}
                </span>
              </p>
              <p className="text-sm mb-2">
                <b className="text-slate-700">CNIC:</b>{" "}
                <span className="text-slate-600 font-mono">
                  {selectedCustomer.cnic}
                </span>
              </p>
              <p className="text-sm mb-2">
                <b className="text-slate-700">Phone:</b>{" "}
                <span className="text-slate-600 font-mono">
                  {selectedCustomer.phone || "—"}
                </span>
              </p>
              <p className="text-sm">
                <b className="text-slate-700">Email:</b>{" "}
                <span className="text-slate-600">
                  {selectedCustomer.email || "—"}
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Plots */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-green-600 rounded-full"></span>Select
            Plot
          </h3>

          {/* Block Selector */}
          <div className="mb-3">
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Block
            </label>
            <select
              value={selectedBlockId}
              onChange={(e) => {
                setSelectedBlockId(e.target.value);
                setSelectedPlotId("");
              }}
              className="border border-gray-300 w-full p-3 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition"
            >
              <option value="">-- Select Block --</option>
              {uniqueBlocks.map((block) => (
                <option key={block} value={block}>
                  {block}
                </option>
              ))}
            </select>
          </div>

          {/* Plot Number Selector */}
          <div className="mb-3">
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Plot No
            </label>
            <select
              value={selectedPlotId}
              onChange={(e) => setSelectedPlotId(e.target.value)}
              disabled={!selectedBlockId}
              className="border border-gray-300 w-full p-3 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition disabled:bg-gray-100 disabled:text-gray-400"
            >
              <option value="">-- Select Plot --</option>
              {filteredPlots.map((p) => (
                <option key={p.id} value={p.id}>
                  Plot {p.plotNumber} • {p.size} • PKR{" "}
                  {Number(p.price).toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          {selectedPlot && (
            <div className="bg-linear-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
              <p className="text-sm mb-2">
                <b className="text-slate-700">Plot Number:</b>{" "}
                <span className="text-slate-600 font-mono">
                  {selectedPlot.plotNumber}
                </span>
              </p>
              <p className="text-sm mb-2">
                <b className="text-slate-700">Block:</b>{" "}
                <span className="text-slate-600">{selectedPlot.block}</span>
              </p>
              <p className="text-sm mb-2">
                <b className="text-slate-700">Size:</b>{" "}
                <span className="text-slate-600">{selectedPlot.size}</span>
              </p>
              <p className="text-sm mb-2">
                <b className="text-slate-700">Price:</b>{" "}
                <span className="text-slate-600 font-mono">
                  PKR {Number(selectedPlot.price).toLocaleString("en-PK")}
                </span>
              </p>
              <p className="text-sm mb-2">
                <b className="text-slate-700">Category:</b>{" "}
                <span className="text-slate-600">{selectedPlot.category}</span>
              </p>
              <p className="text-sm">
                <b className="text-slate-700">Status:</b>{" "}
                <span className="text-green-600 font-semibold">
                  {selectedPlot.status}
                </span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 mb-6">
        {editBookingId && (
          <button
            onClick={resetForm}
            className="bg-gray-400 text-white px-6 py-2 rounded-lg shadow hover:bg-gray-500 flex items-center gap-2 transition"
          >
            <MdClose size={18} /> Cancel
          </button>
        )}
        <button
          onClick={() => {
            console.log("Selected Customer:", selectedCustomer);
            console.log("Selected Plot:", selectedPlot);
            handleBooking();
          }}
          disabled={!selectedCustomer || !selectedPlot}
          className="bg-linear-to-r from-green-600 to-emerald-600 text-white px-6 py-2 rounded-lg shadow hover:from-green-700 hover:to-emerald-700 flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
        >
          <MdCheck size={20} />{" "}
          {editBookingId ? "✓ Update Booking" : "✓ Book Plot"}
        </button>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="bg-linear-to-r from-slate-50 to-blue-50 px-6 py-4 border-b">
          <h3 className="font-bold text-slate-800 text-lg">All Bookings</h3>
        </div>
        <div className="overflow-x-auto hide-scrollbar">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-sm font-semibold text-gray-700">
                  Customer
                </th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-700">
                  CNIC
                </th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-700">
                  Plot No
                </th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-700">
                  Block
                </th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-700">
                  Size
                </th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-700">
                  Price
                </th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-700">
                  Category
                </th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-700">
                  Booking Date
                </th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-700 text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {bookings.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    📭 No bookings yet. Create your first booking above!
                  </td>
                </tr>
              ) : (
                bookings.map((b, idx) => (
                  <tr
                    key={b.id}
                    className={
                      idx % 2 === 0
                        ? "hover:bg-gray-50"
                        : "bg-gray-50 hover:bg-gray-100"
                    }
                  >
                    <td className="px-6 py-4 text-sm font-medium text-slate-800">
                      {b.customerName}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-mono">
                      {b.customerCnic}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-indigo-600">
                      {b.plotNumber}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {b.block}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {b.size}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-800">
                      PKR {Number(b.price).toLocaleString("en-PK")}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                        {b.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {b.bookingDate || "—"}
                    </td>
                    <td className="px-6 py-4 text-center flex justify-center gap-2">
                      <button
                        onClick={() => handleEditBooking(b)}
                        className="text-yellow-600 hover:bg-yellow-50 p-2 rounded-lg transition"
                        title="Edit Booking"
                      >
                        <MdEdit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteBooking(b.id)}
                        className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition"
                        title="Delete Booking"
                      >
                        <MdDelete size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
