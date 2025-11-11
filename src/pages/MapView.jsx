import React, { useState } from "react";
import { useSelector } from "react-redux";
import toast, { Toaster } from "react-hot-toast";

export default function PlotMap() {
  const plots = useSelector((state) => state.plots.plots ?? []);
  const customers = useSelector((state) => state.customers.list ?? []);
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [blockFilter, setBlockFilter] = useState("all");
  const [hoveredPlot, setHoveredPlot] = useState(null);

  // Unique blocks for dropdown
  const blocks = [...new Set(plots.map(p => p.block.toUpperCase()))];

  // Filtered plots based on selected filters
  const filteredPlots = plots.filter((p) => {
    const statusCheck =
      statusFilter === "all" ? true : p.status.toLowerCase() === statusFilter;
    const categoryCheck =
      categoryFilter === "all"
        ? true
        : p.category.toLowerCase() === categoryFilter;
    const blockCheck =
      blockFilter === "all" ? true : p.block.toUpperCase() === blockFilter;
    return statusCheck && categoryCheck && blockCheck;
  });

  // Find customer booked for this plot
  const getCustomerForPlot = (plotNumber) =>
    customers.find((c) => c.plotNumber === plotNumber);

  return (
    <div className="p-6">
      <Toaster position="top-right" />

      <h2 className="text-2xl font-semibold text-slate-800 mb-4">
        Housing Society Map
      </h2>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 items-start sm:items-center">
        <div>
          <label className="mr-2 font-medium text-slate-700">Block:</label>
          <select
            value={blockFilter}
            onChange={(e) => setBlockFilter(e.target.value)}
            className="border px-3 py-1 rounded-md"
          >
            <option value="all">All</option>
            {blocks.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mr-2 font-medium text-slate-700">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border px-3 py-1 rounded-md"
          >
            <option value="all">All</option>
            <option value="available">Available</option>
            <option value="sold">Booked</option>
          </select>
        </div>

        <div>
          <label className="mr-2 font-medium text-slate-700">Category:</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border px-3 py-1 rounded-md"
          >
            <option value="all">All</option>
            <option value="residential">Residential</option>
            <option value="commercial">Commercial</option>
          </select>
        </div>
      </div>

      {/* Plot Map Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
        {filteredPlots.map((plot) => {
          const customer = getCustomerForPlot(plot.plotNumber);
          const isBooked = plot.status.toLowerCase() === "sold";
          const isResidential = plot.category.toLowerCase() === "residential";

          return (
            <div
              key={plot.plotNumber}
              className={`relative border rounded-lg h-24 flex items-center justify-center cursor-pointer transition transform hover:scale-105 ${
                isBooked
                  ? "bg-red-200 border-red-400"
                  : isResidential
                  ? "bg-green-200 border-green-400"
                  : "bg-yellow-200 border-yellow-400"
              }`}
              onMouseEnter={() => setHoveredPlot({ plot, customer })}
              onMouseLeave={() => setHoveredPlot(null)}
            >
              <span className="font-semibold">{plot.plotNumber}</span>
            </div>
          );
        })}
      </div>

      {/* Hover Info Panel */}
      {hoveredPlot && (
        <div className="fixed top-20 right-6 bg-white border shadow-lg rounded-lg p-4 w-80 z-50">
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            Plot Info - {hoveredPlot.plot.plotNumber}
          </h3>
          <p>
            <b>Block:</b> {hoveredPlot.plot.block}
          </p>
          <p>
            <b>Size:</b> {hoveredPlot.plot.size}
          </p>
          <p>
            <b>Price:</b> PKR {Number(hoveredPlot.plot.price).toLocaleString()}
          </p>
          <p>
            <b>Status:</b> {hoveredPlot.plot.status}
          </p>
          <p>
            <b>Category:</b> {hoveredPlot.plot.category}
          </p>
          {hoveredPlot.customer ? (
            <>
              <hr className="my-2" />
              <h4 className="font-semibold text-slate-700">Customer Info</h4>
              <p>
                <b>Name:</b> {hoveredPlot.customer.fullName}
              </p>
              <p>
                <b>CNIC:</b> {hoveredPlot.customer.cnic}
              </p>
              <p>
                <b>Phone:</b> {hoveredPlot.customer.phone}
              </p>
            </>
          ) : (
            <p className="text-gray-500 mt-2">Plot is Available</p>
          )}
        </div>
      )}
    </div>
  );
}
