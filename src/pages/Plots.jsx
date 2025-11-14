import { useState } from "react";
import { MdAdd, MdEdit, MdClose } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { addPlot, updatePlot } from "../features/PlotsSlice.jsx";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

export default function Plots() {
  const dispatch = useDispatch();
  const plots = useSelector((state) => state.plots.plots);

  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [sizeUnit, setSizeUnit] = useState("Marla");

  const [form, setForm] = useState({
    plotNumber: "",
    block: "",
    sizeValue: "",
    status: "Available",
    owner: "",
    price: "",
    category: "Residential",
  });

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === "block") value = value.toUpperCase();
    setForm({ ...form, [name]: value });
  };

  const validateForm = () => {
    const { plotNumber, block, sizeValue, price, category } = form;
    if (!plotNumber || !block || !sizeValue || !price || !category)
      return false;
    if (!Number.isInteger(Number(plotNumber))) return false;
    if (block.length !== 1) return false;
    if (isNaN(sizeValue) || Number(sizeValue) <= 0) return false;
    if (isNaN(price) || Number(price) <= 0) return false;
    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      toast.error("Please fill all fields correctly!");
      return;
    }

    const fullSize = `${form.sizeValue} ${sizeUnit}`;

    if (editIndex !== null) {
      dispatch(
        updatePlot({ index: editIndex, data: { ...form, size: fullSize } })
      );
      toast.success("Plot updated successfully!");
      setEditIndex(null);
    } else {
      dispatch(addPlot({ ...form, size: fullSize, id: Date.now() }));
      toast.success("Plot added successfully!");
    }

    setForm({
      plotNumber: "",
      block: "",
      sizeValue: "",
      status: "Available",
      owner: "",
      price: "",
      category: "Residential",
    });
    setSizeUnit("Marla");
    setShowModal(false);
  };

  const handleRowDoubleClick = (index) => {
    const p = plots[index];
    setForm({
      plotNumber: p.plotNumber,
      block: p.block,
      sizeValue: p.size.split(" ")[0],
      status: p.status,
      owner: p.owner,
      price: p.price,
      category: p.category,
    });
    setSizeUnit(p.size.split(" ")[1]);
    setEditIndex(index);
    setShowModal(true);
  };

  const formatPrice = (price) => Number(price).toLocaleString("en-PK");

  // Stats Cards
  const availablePlots = plots.filter((p) => p.status === "Available").length;
  const soldPlots = plots.filter((p) => p.status === "Sold").length;
  const totalValue = plots.reduce((sum, p) => sum + Number(p.price || 0), 0);

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          Plots Management
        </h1>
        <p className="text-gray-600">
          Manage your residential and commercial plots
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-linear-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Total Plots</p>
          <p className="text-3xl font-bold text-blue-600">{plots.length}</p>
        </div>
        <div className="bg-linear-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Available</p>
          <p className="text-3xl font-bold text-green-600">{availablePlots}</p>
        </div>
        <div className="bg-linear-to-br from-red-50 to-red-100 rounded-xl p-6 border border-red-200 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Sold</p>
          <p className="text-3xl font-bold text-red-600">{soldPlots}</p>
        </div>
        <div className="bg-linear-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Total Value</p>
          <p className="text-2xl font-bold text-purple-600">
            PKR {(totalValue / 10000000).toFixed(1)}Cr
          </p>
        </div>
      </div>

      {/* Header with Button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">All Plots</h2>
        <button
          className="flex items-center gap-2 bg-linear-to-r bg-blue-700  text-white px-6 py-2.5 rounded-lg shadow-lg hover:from-indigo-700 hover:to-blue-700 font-semibold transition transform hover:scale-105"
          onClick={() => {
            setForm({
              plotNumber: "",
              block: "",
              sizeValue: "",
              status: "Available",
              owner: "",
              price: "",
              category: "Residential",
            });
            setEditIndex(null);
            setShowModal(true);
          }}
        >
          <MdAdd size={22} /> Add Plot
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto hide-scrollbar">
          <table className="w-full text-sm">
            <thead className="bg-linear-to-r from-slate-50 to-slate-100 border-b border-gray-200">
              <tr>
                <th className="py-4 px-6 text-left font-semibold text-gray-700">
                  Plot No
                </th>
                <th className="px-6 text-left font-semibold text-gray-700">
                  Block
                </th>
                <th className="px-6 text-left font-semibold text-gray-700">
                  Size
                </th>
                <th className="px-6 text-left font-semibold text-gray-700">
                  Price (PKR)
                </th>
                <th className="px-6 text-left font-semibold text-gray-700">
                  Category
                </th>
                <th className="px-6 text-left font-semibold text-gray-700">
                  Status
                </th>
                <th className="px-6 text-left font-semibold text-gray-700">
                  Owner
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {plots.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-500">
                    📭 No plots added yet. Click "Add Plot" to create your first
                    plot.
                  </td>
                </tr>
              ) : (
                plots.map((p, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 cursor-pointer transition"
                    onDoubleClick={() => handleRowDoubleClick(index)}
                  >
                    <td className="py-4 px-6 font-semibold text-indigo-600">
                      {p.plotNumber}
                    </td>
                    <td className="px-6">
                      <Link
                        to={`/plots/block/${p.block}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                      >
                        {p.block.toUpperCase()}
                      </Link>
                    </td>
                    <td className="px-6 text-gray-700">{p.size}</td>
                    <td className="px-6 font-semibold text-gray-800">
                      PKR {formatPrice(p.price)}
                    </td>
                    <td className="px-6">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          p.category === "Residential"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {p.category}
                      </span>
                    </td>
                    <td className="px-6">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          p.status === "Available"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 text-gray-700">{p.owner || "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Plot Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 px-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="relative z-50 w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-y-auto max-h-[90vh] hide-scrollbar">
            {/* Modal Header */}
            <div className="sticky top-0 z-10 bg-linear-to-r bg-blue-600 px-8 py-6 flex items-center justify-between border-b border-indigo-700">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">
                    {editIndex !== null ? "✏️" : "➕"}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {editIndex !== null ? "Edit Plot" : "Add New Plot"}
                  </h2>
                  <p className="text-blue-100 text-sm mt-0.5">
                    {editIndex !== null
                      ? "Update plot details"
                      : "Create a new plot listing"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition"
              >
                <MdClose size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <form className="p-8 space-y-6">
              {/* Plot Basic Info */}
              <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-lg p-5 border border-blue-200">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <span className="w-1 h-4 bg-indigo-600 rounded-full"></span>
                  Plot Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                      Plot Number *
                    </label>
                    <input
                      type="number"
                      name="plotNumber"
                      placeholder="Enter plot number"
                      value={form.plotNumber}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                      Block (A-Z) *
                    </label>
                    <input
                      type="text"
                      maxLength={1}
                      name="block"
                      placeholder="A"
                      value={form.block}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition uppercase"
                    />
                  </div>
                </div>
              </div>

              {/* Size and Price */}
              <div className="bg-linear-to-br from-green-50 to-emerald-50 rounded-lg p-5 border border-green-200">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <span className="w-1 h-4 bg-green-600 rounded-full"></span>
                  Size & Price
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                      Size *
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min={0}
                        name="sizeValue"
                        placeholder="Enter size"
                        value={form.sizeValue}
                        onChange={handleChange}
                        className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition"
                      />
                      <select
                        name="sizeUnit"
                        value={sizeUnit}
                        onChange={(e) => setSizeUnit(e.target.value)}
                        className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition font-semibold"
                      >
                        <option value="Marla">Marla</option>
                        <option value="Kanal">Kanal</option>
                        <option value="Acre">Acre</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                      Price (PKR) *
                    </label>
                    <input
                      type="number"
                      name="price"
                      placeholder="Enter price"
                      value={form.price}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition"
                    />
                  </div>
                </div>
              </div>

              {/* Category and Status */}
              <div className="bg-linear-to-br from-amber-50 to-orange-50 rounded-lg p-5 border border-amber-200">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <span className="w-1 h-4 bg-amber-600 rounded-full"></span>
                  Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition"
                    >
                      <option value="Residential">Residential</option>
                      <option value="Commercial">Commercial</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                      Status *
                    </label>
                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition"
                    >
                      <option value="Available">Available</option>
                      <option value="Sold">Sold</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    Owner Name (Optional)
                  </label>
                  <input
                    type="text"
                    name="owner"
                    placeholder="Enter owner name"
                    value={form.owner}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition"
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="flex-1 bg-linear-to-r from-indigo-600 to-blue-600 text-white py-3 rounded-lg hover:from-indigo-700 hover:to-blue-700 font-semibold shadow-lg hover:shadow-xl transition transform hover:scale-105"
                >
                  {editIndex !== null ? "💾 Update Plot" : "➕ Add Plot"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
