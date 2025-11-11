import React, { useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import toast, { Toaster } from "react-hot-toast";
import { MdCheck, MdDelete, MdEdit } from "react-icons/md";
import { addBooking, updateBooking, deleteBooking } from "../features/BookingsSlice.jsx";
import { updatePlot } from "../features/PlotsSlice.jsx";

export default function BookingPage() {
  const dispatch = useDispatch();
  const customers = useSelector(state => state.customers.list ?? []);
  const plots = useSelector(state => state.plots.plots ?? []);
  const bookings = useSelector(state => state.bookings.list ?? []);

  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedPlotId, setSelectedPlotId] = useState("");
  const [searchCustomer, setSearchCustomer] = useState("");
  const [searchPlot, setSearchPlot] = useState("");
  const [editBookingId, setEditBookingId] = useState(null);

  const filteredCustomers = useMemo(
    () => customers.filter(c => c.fullName.toLowerCase().includes(searchCustomer.toLowerCase())),
    [customers, searchCustomer]
  );

  const filteredPlots = useMemo(
    () => plots.filter(
      p => p.status === "Available" &&
      (p.plotNumber.toString().includes(searchPlot) || p.block.toLowerCase().includes(searchPlot.toLowerCase()))
    ),
    [plots, searchPlot]
  );

  const selectedCustomer = customers.find(c => c.id === Number(selectedCustomerId));
  const selectedPlot = plots.find(p => p.id === Number(selectedPlotId));

  const handleBooking = () => {
    if (!selectedCustomer || !selectedPlot) {
      toast.error("Please select both a customer and a plot.");
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
    };

    if (editBookingId) {
      dispatch(updateBooking({ id: editBookingId, updatedData: bookingData }));
      toast.success("Booking updated successfully!");
      setEditBookingId(null);
    } else {
      dispatch(addBooking(bookingData));
      toast.success("Plot booked successfully!");
    }

    // Update plot status to Booked
    const plotIndex = plots.findIndex(p => p.id === selectedPlot.id);
    if (plotIndex !== -1) {
      dispatch(updatePlot({ index: plotIndex, data: { ...selectedPlot, status: "Booked" } }));
    }

    setSelectedCustomerId("");
    setSelectedPlotId("");
    setSearchCustomer("");
    setSearchPlot("");
  };

  const handleEditBooking = (b) => {
    setEditBookingId(b.id);
    setSelectedCustomerId(b.customerId.toString());
    setSelectedPlotId(b.plotId.toString());
  };

  const handleDeleteBooking = (id) => {
    const booking = bookings.find(b => b.id === id);
    if (!booking) return;

    // Reset plot status
    const plotIndex = plots.findIndex(p => p.id === booking.plotId);
    if (plotIndex !== -1) {
      dispatch(updatePlot({ index: plotIndex, data: { ...plots[plotIndex], status: "Available" } }));
    }

    dispatch(deleteBooking(id));
    toast.success("Booking deleted successfully!");
  };

  return (
    <div className="p-6">
      <Toaster position="top-right" />
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Booking Management</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Customers */}
        <div className="bg-white p-4 rounded-lg shadow-md border">
          <h3 className="font-semibold mb-3">Select Customer</h3>
          <input
            type="text"
            placeholder="Search customer..."
            value={searchCustomer}
            onChange={(e) => setSearchCustomer(e.target.value)}
            className="border w-full p-2 rounded mb-3"
          />
          <select
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            className="border w-full p-2 rounded"
          >
            <option value="">-- Select Customer --</option>
            {filteredCustomers.map(c => (
              <option key={c.id} value={c.id}>
                {c.fullName} ({c.cnic})
              </option>
            ))}
          </select>
          {selectedCustomer && (
            <div className="bg-gray-50 p-3 rounded mt-3">
              <p><b>Name:</b> {selectedCustomer.fullName}</p>
              <p><b>CNIC:</b> {selectedCustomer.cnic}</p>
              <p><b>Phone:</b> {selectedCustomer.phone || "—"}</p>
              <p><b>Email:</b> {selectedCustomer.email || "—"}</p>
            </div>
          )}
        </div>

        {/* Plots */}
        <div className="bg-white p-4 rounded-lg shadow-md border">
          <h3 className="font-semibold mb-3">Select Plot</h3>
          <input
            type="text"
            placeholder="Search plot..."
            value={searchPlot}
            onChange={(e) => setSearchPlot(e.target.value)}
            className="border w-full p-2 rounded mb-3"
          />
          <select
            value={selectedPlotId}
            onChange={(e) => setSelectedPlotId(e.target.value)}
            className="border w-full p-2 rounded"
          >
            <option value="">-- Select Plot --</option>
            {filteredPlots.map(p => (
              <option key={p.id} value={p.id}>
                {p.plotNumber} - {p.block} ({p.size})
              </option>
            ))}
          </select>
          {selectedPlot && (
            <div className="bg-gray-50 p-3 rounded mt-3">
              <p><b>Plot Number:</b> {selectedPlot.plotNumber}</p>
              <p><b>Block:</b> {selectedPlot.block}</p>
              <p><b>Size:</b> {selectedPlot.size}</p>
              <p><b>Price:</b> {Number(selectedPlot.price).toLocaleString("en-PK")} PKR</p>
              <p><b>Category:</b> {selectedPlot.category}</p>
              <p><b>Status:</b> {selectedPlot.status}</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end mb-6">
        <button
          onClick={handleBooking}
          className="bg-green-600 text-white px-6 py-2 rounded-md shadow hover:bg-green-700 flex items-center gap-2"
        >
          <MdCheck size={20} /> {editBookingId ? "Update Booking" : "Book Plot"}
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md border overflow-x-auto">
        <h3 className="font-semibold mb-3">All Bookings</h3>
        <table className="w-full min-w-max text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2">Customer</th>
              <th className="px-4 py-2">CNIC</th>
              <th className="px-4 py-2">Plot No</th>
              <th className="px-4 py-2">Block</th>
              <th className="px-4 py-2">Size</th>
              <th className="px-4 py-2">Price</th>
              <th className="px-4 py-2">Category</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-gray-500">
                  No bookings yet.
                </td>
              </tr>
            ) : bookings.map(b => (
              <tr key={b.id} className="hover:bg-gray-50">
                <td className="px-4 py-2">{b.customerName}</td>
                <td className="px-4 py-2">{b.customerCnic}</td>
                <td className="px-4 py-2">{b.plotNumber}</td>
                <td className="px-4 py-2">{b.block}</td>
                <td className="px-4 py-2">{b.size}</td>
                <td className="px-4 py-2">{Number(b.price).toLocaleString("en-PK")} PKR</td>
                <td className="px-4 py-2">{b.category}</td>
                <td className="px-4 py-2 flex gap-2">
                  <button onClick={() => handleEditBooking(b)} className="text-yellow-600 hover:bg-gray-100 p-2 rounded"><MdEdit size={18} /></button>
                  <button onClick={() => handleDeleteBooking(b.id)} className="text-red-600 hover:bg-gray-100 p-2 rounded"><MdDelete size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
