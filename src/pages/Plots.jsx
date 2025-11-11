import { useState } from "react";
import { MdAdd } from "react-icons/md";
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
    if (!plotNumber || !block || !sizeValue || !price || !category) return false;
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
      dispatch(updatePlot({ index: editIndex, data: { ...form, size: fullSize } }));
      toast.success("Plot updated successfully!");
      setEditIndex(null);
    } else {
      dispatch(addPlot({ ...form, size: fullSize }));
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

  return (
    <div className="p-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-3">
        <h2 className="text-2xl font-bold text-slate-800">Plots</h2>
        <button
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg shadow hover:bg-blue-700 transition"
          onClick={() => setShowModal(true)}
        >
          <MdAdd size={22} /> Add Plot
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white shadow-md rounded-lg p-4 border border-gray-200">
        <table className="w-full text-sm md:text-base">
          <thead>
            <tr className="text-left text-slate-600 border-b border-slate-200">
              <th className="py-3 px-2">Plot No</th>
              <th className="px-2">Block</th>
              <th className="px-2">Size</th>
              <th className="px-2">Price (PKR)</th>
              <th className="px-2">Category</th>
              <th className="px-2">Status</th>
              <th className="px-2">Owner</th>
            </tr>
          </thead>
          <tbody>
            {plots.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-5 text-gray-500">
                  No plots added yet
                </td>
              </tr>
            ) : (
              plots.map((p, index) => (
                <tr
                  key={index}
                  className="border-b last:border-none hover:bg-gray-50 cursor-pointer transition"
                  onDoubleClick={() => handleRowDoubleClick(index)}
                >
                  <td className="py-3 px-2">{p.plotNumber}</td>
                  <td className="px-2">
                    <Link
                      to={`/plots/block/${p.block}`}
                      className="text-blue-600 hover:underline"
                    >
                      {p.block.toUpperCase()}
                    </Link>
                  </td>
                  <td className="px-2">{p.size}</td>
                  <td className="px-2">{formatPrice(p.price)}</td>
                  <td className="px-2">{p.category}</td>
                  <td className="px-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        p.status === "Available"
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-2">{p.owner || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Plot Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xl p-6 animate-fadeIn">
            <h3 className="text-xl font-semibold text-slate-700 mb-5">
              {editIndex !== null ? "Edit Plot" : "Add New Plot"}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="number"
                name="plotNumber"
                placeholder="Plot Number"
                value={form.plotNumber}
                onChange={handleChange}
                className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-400 outline-none transition"
              />
              <input
                type="text"
                maxLength={1}
                name="block"
                placeholder="Block (A-Z)"
                value={form.block}
                onChange={handleChange}
                className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-400 outline-none transition"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  min={0}
                  name="sizeValue"
                  placeholder="Size"
                  value={form.sizeValue}
                  onChange={handleChange}
                  className="border p-3 rounded-lg w-1/2 focus:ring-2 focus:ring-blue-400 outline-none transition"
                />
                <select
                  name="sizeUnit"
                  value={sizeUnit}
                  onChange={(e) => setSizeUnit(e.target.value)}
                  className="border p-3 rounded-lg w-1/2 focus:ring-2 focus:ring-blue-400 outline-none transition"
                >
                  <option value="Marla">Marla</option>
                  <option value="Kanal">Kanal</option>
                  <option value="Acre">Acre</option>
                </select>
              </div>
              <input
                type="number"
                name="price"
                placeholder="Price (PKR)"
                value={form.price}
                onChange={handleChange}
                className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-400 outline-none transition"
              />
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-400 outline-none transition"
              >
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
              </select>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-400 outline-none transition"
              >
                <option value="Available">Available</option>
                <option value="Sold">Sold</option>
              </select>
              <input
                type="text"
                name="owner"
                placeholder="Owner Name (optional)"
                value={form.owner}
                onChange={handleChange}
                className="border p-3 rounded-lg w-full md:col-span-2 focus:ring-2 focus:ring-blue-400 outline-none transition"
              />
            </div>

            <div className="flex flex-col md:flex-row justify-end gap-3 mt-6">
              <button
                className="px-5 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition"
                onClick={() => {
                  setShowModal(false);
                  setEditIndex(null);
                }}
              >
                Cancel
              </button>
              <button
                className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                onClick={handleSubmit}
              >
                {editIndex !== null ? "Update Plot" : "Add Plot"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
