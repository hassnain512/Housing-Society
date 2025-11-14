// pages/Reacquisition.jsx
import React, { useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import toast, { Toaster } from "react-hot-toast";
import {
  addReacquisition,
  updateReacquisition,
  setStatus,
  removeReacquisition,
} from "../features/ReacquisitionSlice.jsx";
import { MdCheckCircle, MdClose, MdDownload } from "react-icons/md";

const readFileAsBase64 = (file) =>
  new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => res(fr.result);
    fr.onerror = rej;
    fr.readAsDataURL(file);
  });

export default function Reacquisition() {
  const dispatch = useDispatch();
  const plots = useSelector((s) => s.plots.plots ?? []);
  const customers = useSelector((s) => s.customers.list ?? []);
  const reacqs = useSelector((s) => s.reacquisition.list ?? []);
  const [selectedPlotId, setSelectedPlotId] = useState("");
  const [area, setArea] = useState("");
  const [price, setPrice] = useState("");
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [receiptFile, setReceiptFile] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewDetails, setViewDetails] = useState(null);

  const selectedPlot = plots.find((p) => p.id === Number(selectedPlotId));
  const owner = selectedPlot
    ? customers.find(
        (c) => c.id === selectedPlot.ownerId || c.plotId === selectedPlot.id
      )
    : null;

  const eligiblePlots = plots.filter((p) => p.status !== "Available");

  // Stats
  const stats = {
    total: reacqs.length,
    pending: reacqs.filter((r) => r.status === "pending").length,
    approved: reacqs.filter((r) => r.status === "approved").length,
    rejected: reacqs.filter((r) => r.status === "rejected").length,
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return setReceiptFile(null);
    if (!/image\/(png|jpeg|jpg)/.test(file.type)) {
      toast.error("Receipt must be PNG/JPG/JPEG");
      return;
    }
    const b = await readFileAsBase64(file);
    setReceiptFile({ name: file.name, data: b });
  };

  const validate = () => {
    if (!selectedPlot) {
      toast.error("Choose a plot");
      return false;
    }
    if (!owner) {
      toast.error("Plot owner not found");
      return false;
    }
    if (!area || Number(area) <= 0) {
      toast.error("Enter valid area (sq ft)");
      return false;
    }
    if (!price || Number(price) <= 0) {
      toast.error("Enter valid price");
      return false;
    }
    if (!paymentMode) {
      toast.error("Choose payment mode");
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const payload = {
      id: Date.now(),
      plotId: selectedPlot.id,
      plotNumber: selectedPlot.plotNumber,
      block: selectedPlot.block,
      currentArea: selectedPlot.size || 0,
      additionalArea: Number(area),
      totalArea: Number(selectedPlot.size?.split(" ")[0] || 0) + Number(area),
      ownerId: owner.id,
      ownerName: owner.fullName,
      ownerCnic: owner.cnic,
      price: Number(price),
      pricePerSqFt: Number(price) / Number(area),
      paymentMode,
      receiptFile,
      remarks,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    dispatch(addReacquisition(payload));
    toast.success("Land expansion request submitted");
    setSelectedPlotId("");
    setArea("");
    setPrice("");
    setPaymentMode("Cash");
    setReceiptFile(null);
    setRemarks("");
  };

  const handleApprove = (r) => {
    dispatch(setStatus({ id: r.id, status: "approved" }));
    toast.success("Land expansion approved!");
  };

  const handleReject = (r) => {
    dispatch(setStatus({ id: r.id, status: "rejected" }));
    toast("Request rejected", { icon: "⚠️" });
  };

  const exportCSV = () => {
    const rows = [
      "id,plotNumber,block,ownerName,additionalArea,currentArea,totalArea,price,status,createdAt",
    ];
    reacqs.forEach((r) => {
      rows.push(
        [
          r.id,
          r.plotNumber,
          r.block,
          `"${r.ownerName}"`,
          r.additionalArea,
          r.currentArea,
          r.totalArea,
          r.price,
          r.status,
          r.createdAt,
        ].join(",")
      );
    });
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "land-expansion.csv";
    a.click();
  };

  const visible = reacqs.filter((r) =>
    filterStatus === "all" ? true : r.status === filterStatus
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          Land Expansion Management
        </h1>
        <p className="text-gray-600">
          Manage society land acquisition and expansion requests
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">
                Total Requests
              </p>
              <p className="text-3xl font-bold text-slate-800 mt-2">
                {stats.total}
              </p>
            </div>
            <div className="text-4xl opacity-20">📋</div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-yellow-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-600 text-sm font-medium">Pending</p>
              <p className="text-3xl font-bold text-yellow-700 mt-2">
                {stats.pending}
              </p>
            </div>
            <div className="text-4xl opacity-30">⏳</div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-green-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Approved</p>
              <p className="text-3xl font-bold text-green-700 mt-2">
                {stats.approved}
              </p>
            </div>
            <div className="text-4xl opacity-30">✓</div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 text-sm font-medium">Rejected</p>
              <p className="text-3xl font-bold text-red-700 mt-2">
                {stats.rejected}
              </p>
            </div>
            <div className="text-4xl opacity-30">✕</div>
          </div>
        </div>
      </div>

      {/* Form & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Form Section */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-indigo-600 rounded-full"></span>
            New Land Expansion Request
          </h3>

          <div className="space-y-5">
            {/* Plot Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Plot
              </label>
              <select
                value={selectedPlotId}
                onChange={(e) => setSelectedPlotId(e.target.value)}
                className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              >
                <option value="">-- Choose plot for expansion --</option>
                {eligiblePlots.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.block} - Plot {p.plotNumber} ({p.size})
                  </option>
                ))}
              </select>
            </div>

            {/* Area & Price */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Additional Area (sq ft)
                </label>
                <input
                  type="number"
                  placeholder="e.g., 500"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Acquisition Price (PKR)
                </label>
                <input
                  type="number"
                  placeholder="e.g., 500000"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            {/* Payment Mode */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Payment Mode
              </label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              >
                <option>Cash</option>
                <option>Bank Transfer</option>
                <option>Cheque</option>
                <option>Other</option>
              </select>
            </div>

            {/* Receipt Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Receipt/Document (optional)
              </label>
              <label className="block">
                <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-indigo-400 transition text-center cursor-pointer">
                  {receiptFile ? (
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 text-left">
                        <p className="font-medium text-gray-700">
                          {receiptFile.name}
                        </p>
                        <p className="text-xs text-gray-500">Ready to upload</p>
                      </div>
                      <button
                        onClick={() => setReceiptFile(null)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <MdClose size={20} />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-600 font-medium">
                        📎 Click to upload receipt
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG, JPEG (max 5MB)
                      </p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/png, image/jpeg"
                    onChange={handleFile}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </label>
            </div>

            {/* Remarks */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Remarks (optional)
              </label>
              <textarea
                placeholder="Add any additional notes..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSubmit}
                className="flex-1 bg-linear-to-r from-indigo-600 to-blue-600 text-white py-3 rounded-lg hover:from-indigo-700 hover:to-blue-700 font-semibold shadow-lg hover:shadow-xl transition transform hover:scale-105"
              >
                Submit Request
              </button>
              <button
                onClick={() => {
                  setSelectedPlotId("");
                  setArea("");
                  setPrice("");
                  setPaymentMode("Cash");
                  setReceiptFile(null);
                  setRemarks("");
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-semibold transition"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Owner Details Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-amber-500 rounded-full"></span>
            Current Owner
          </h4>
          {!selectedPlot ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">
                Select a plot to view owner details
              </p>
            </div>
          ) : owner ? (
            <div className="space-y-4">
              <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                <p className="text-xs font-semibold text-blue-600 uppercase mb-1">
                  Full Name
                </p>
                <p className="text-lg font-bold text-slate-800">
                  {owner.fullName}
                </p>
              </div>
              <div className="bg-linear-to-br from-amber-50 to-orange-50 rounded-lg p-4 border border-amber-200">
                <p className="text-xs font-semibold text-amber-600 uppercase mb-1">
                  CNIC
                </p>
                <p className="text-lg font-mono text-slate-800">{owner.cnic}</p>
              </div>
              <div className="bg-linear-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                <p className="text-xs font-semibold text-green-600 uppercase mb-1">
                  Contact
                </p>
                <p className="text-lg text-slate-800">{owner.phone || "—"}</p>
              </div>
              <div className="bg-linear-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                <p className="text-xs font-semibold text-purple-600 uppercase mb-1">
                  Current Plot Size
                </p>
                <p className="text-lg font-semibold text-slate-800">
                  {selectedPlot.size}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">Owner record not found</p>
            </div>
          )}
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="w-1 h-6 bg-green-600 rounded-full"></span>
            Land Expansion Requests
          </h3>
          <div className="flex items-center gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <button
              onClick={exportCSV}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition"
            >
              <MdDownload size={18} />
              Export CSV
            </button>
          </div>
        </div>

        {visible.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No land expansion requests found
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-linear-to-r from-slate-50 to-slate-100 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-slate-700">
                    Plot
                  </th>
                  <th className="px-4 py-3 text-left font-bold text-slate-700">
                    Owner
                  </th>
                  <th className="px-4 py-3 text-left font-bold text-slate-700">
                    Current Area
                  </th>
                  <th className="px-4 py-3 text-left font-bold text-slate-700">
                    Additional
                  </th>
                  <th className="px-4 py-3 text-left font-bold text-slate-700">
                    Total
                  </th>
                  <th className="px-4 py-3 text-left font-bold text-slate-700">
                    Price (PKR)
                  </th>
                  <th className="px-4 py-3 text-left font-bold text-slate-700">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left font-bold text-slate-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {visible.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition"
                  >
                    <td className="px-4 py-4 font-semibold text-slate-800">
                      {r.block}-{r.plotNumber}
                    </td>
                    <td className="px-4 py-4 text-gray-700">{r.ownerName}</td>
                    <td className="px-4 py-4 text-gray-700">
                      {r.currentArea} sq ft
                    </td>
                    <td className="px-4 py-4 text-indigo-600 font-semibold">
                      +{r.additionalArea} sq ft
                    </td>
                    <td className="px-4 py-4 text-green-600 font-semibold">
                      {r.totalArea} sq ft
                    </td>
                    <td className="px-4 py-4 font-semibold text-slate-800">
                      PKR {Number(r.price).toLocaleString()}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          r.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : r.status === "approved"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        {r.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleApprove(r)}
                              className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-medium transition text-xs"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(r)}
                              className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium transition text-xs"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => setViewDetails(r)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-medium transition text-xs"
                        >
                          View
                        </button>
                        <button
                          onClick={() => {
                            dispatch(removeReacquisition(r.id));
                            toast.success("Request deleted");
                          }}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition text-xs"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {viewDetails && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 px-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setViewDetails(null)}
          />
          <div className="relative z-50 w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-gray-200 overflow-y-auto max-h-[90vh] hide-scrollbar">
            <div className="sticky top-0 z-10 bg-linear-to-r from-indigo-600 to-blue-600 px-8 py-6 flex items-center justify-between border-b border-indigo-700">
              <h3 className="text-xl font-bold text-white">
                Land Expansion Details
              </h3>
              <button
                onClick={() => setViewDetails(null)}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition"
              >
                <MdClose size={24} />
              </button>
            </div>
            <div className="p-8 space-y-6">
              {/* Request Info */}
              <div className="bg-linear-to-br from-slate-50 to-blue-50 rounded-lg p-6 border border-slate-200">
                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <span className="w-1 h-4 bg-indigo-600 rounded-full"></span>
                  Request Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                      Plot
                    </p>
                    <p className="text-lg font-semibold text-slate-800">
                      {viewDetails.block}-{viewDetails.plotNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                      Status
                    </p>
                    <p
                      className={`text-lg font-semibold ${
                        viewDetails.status === "pending"
                          ? "text-yellow-600"
                          : viewDetails.status === "approved"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {viewDetails.status.charAt(0).toUpperCase() +
                        viewDetails.status.slice(1)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Area Information */}
              <div className="bg-linear-to-br from-amber-50 to-orange-50 rounded-lg p-6 border border-amber-200">
                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <span className="w-1 h-4 bg-amber-600 rounded-full"></span>
                  Area Details
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                      Current
                    </p>
                    <p className="text-lg font-semibold text-slate-800">
                      {viewDetails.currentArea} sq ft
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                      Additional
                    </p>
                    <p className="text-lg font-semibold text-indigo-600">
                      +{viewDetails.additionalArea} sq ft
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                      Total
                    </p>
                    <p className="text-lg font-semibold text-green-600">
                      {viewDetails.totalArea} sq ft
                    </p>
                  </div>
                </div>
              </div>

              {/* Owner Information */}
              <div className="bg-linear-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <span className="w-1 h-4 bg-green-600 rounded-full"></span>
                  Owner Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                      Name
                    </p>
                    <p className="text-lg font-semibold text-slate-800">
                      {viewDetails.ownerName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                      CNIC
                    </p>
                    <p className="text-lg font-mono text-slate-800">
                      {viewDetails.ownerCnic}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-linear-to-br from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <span className="w-1 h-4 bg-purple-600 rounded-full"></span>
                  Payment Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                      Total Price
                    </p>
                    <p className="text-lg font-semibold text-slate-800">
                      PKR {Number(viewDetails.price).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                      Per Sq Ft
                    </p>
                    <p className="text-lg font-semibold text-slate-800">
                      PKR {Number(viewDetails.pricePerSqFt).toLocaleString()}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                      Payment Mode
                    </p>
                    <p className="text-lg font-semibold text-slate-800">
                      {viewDetails.paymentMode}
                    </p>
                  </div>
                </div>
              </div>

              {/* Remarks */}
              {viewDetails.remarks && (
                <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                  <p className="text-xs font-semibold text-blue-700 uppercase mb-2">
                    Remarks
                  </p>
                  <p className="text-gray-700">{viewDetails.remarks}</p>
                </div>
              )}

              {/* Receipt Preview */}
              {viewDetails.receiptFile && (
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <p className="text-xs font-semibold text-gray-700 uppercase mb-3">
                    Receipt/Document
                  </p>
                  <img
                    src={viewDetails.receiptFile.data}
                    alt="Receipt"
                    className="w-full rounded-lg border border-gray-300 shadow-sm"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
