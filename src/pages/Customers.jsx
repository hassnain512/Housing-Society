import React, { useState } from "react";
import {
  MdAdd,
  MdClose,
  MdEdit,
  MdDelete,
  MdRemoveRedEye,
} from "react-icons/md";
import { useSelector, useDispatch } from "react-redux";
import toast, { Toaster } from "react-hot-toast";
import {
  addCustomer,
  updateCustomer,
  deleteCustomer,
} from "../features/CustomersSlice.jsx";

export default function Customers() {
  const dispatch = useDispatch();
  const customers = useSelector((state) => state.customers?.list ?? []);

  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [form, setForm] = useState({
    fullName: "",
    fatherOrSpouse: "",
    cnic: "",
    phone: "",
    email: "",
    address: "",
    nokName: "",
    nokCnic: "",
    nokPhone: "",
    profilePhoto: null,
    cnicFront: null,
    cnicBack: null,
    biometric: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setForm((s) => ({ ...s, [name]: files[0] }));
    } else {
      setForm((s) => ({ ...s, [name]: value }));
    }
  };

  const resetForm = () =>
    setForm({
      fullName: "",
      fatherOrSpouse: "",
      cnic: "",
      phone: "",
      email: "",
      address: "",
      nokName: "",
      nokCnic: "",
      nokPhone: "",
      profilePhoto: null,
      cnicFront: null,
      cnicBack: null,
      biometric: null,
    });

  const formatCnic = (cnic) => {
    let digits = cnic.replace(/-/g, "");
    if (digits.length !== 13) return cnic;
    return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
  };

  const formatPhone = (phone) => {
    let digits = phone.replace(/-/g, "");
    if (digits.length !== 11) return phone;
    return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  };

  const validateCnic = (cnic) => {
    const digits = cnic.replace(/-/g, "");
    return /^\d{13}$/.test(digits);
  };

  const validatePhone = (phone) => {
    const digits = phone.replace(/-/g, "");
    return /^\d{11}$/.test(digits);
  };

  const validateEmail = (email) => {
    if (!email) return true; // optional
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleAddOrEdit = (e) => {
    e.preventDefault();

    if (!form.fullName.trim() || !form.cnic.trim()) {
      toast.error("Please provide Full Name and CNIC");
      return;
    }

    if (!validateCnic(form.cnic)) {
      toast.error("CNIC must be 13 digits (with or without '-')");
      return;
    }

    if (form.phone && !validatePhone(form.phone)) {
      toast.error("Phone must be 11 digits (with or without '-')");
      return;
    }

    if (!validateEmail(form.email)) {
      toast.error("Invalid email address");
      return;
    }

    const customerData = {
      ...form,
      cnic: formatCnic(form.cnic),
      phone: form.phone ? formatPhone(form.phone) : "",
      nokCnic: form.nokCnic ? formatCnic(form.nokCnic) : "",
      nokPhone: form.nokPhone ? formatPhone(form.nokPhone) : "",
    };

    if (editMode) {
      dispatch(
        updateCustomer({ id: selectedCustomer.id, updatedData: customerData })
      );
      toast.success("Customer updated successfully!");
    } else {
      dispatch(addCustomer({ ...customerData, id: Date.now() }));
      toast.success("Customer added successfully!");
    }

    setOpen(false);
    resetForm();
    setEditMode(false);
  };

  const handleEdit = (c) => {
    setSelectedCustomer(c);
    setEditMode(true);
    setForm({
      ...c,
      profilePhoto: c.profilePhoto || null,
      cnicFront: c.cnicFront || null,
      cnicBack: c.cnicBack || null,
      biometric: c.biometric || null,
    });
    setOpen(true);
  };

  const handleDelete = (id) => {
    dispatch(deleteCustomer(id));
    toast.success("Customer deleted successfully!");
  };

  const getPreviewURL = (file) => (file ? URL.createObjectURL(file) : null);

  return (
    <div className="p-6">
      <Toaster position="top-right" />

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          Customers Management
        </h1>
        <p className="text-gray-600">
          Manage and track all registered customers
        </p>
      </div>

      {/* Add Button */}
      <div className="mb-6 flex justify-end">
        <button
          onClick={() => {
            resetForm();
            setEditMode(false);
            setOpen(true);
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-indigo-600 to-blue-600 text-white rounded-lg shadow-lg hover:from-indigo-700 hover:to-blue-700 font-semibold transition transform hover:scale-105"
        >
          <MdAdd size={20} />
          Add Customer
        </button>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-linear-to-r from-slate-50 to-slate-100 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Name
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                CNIC
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Phone
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Email
              </th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {customers.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  <div className="flex flex-col items-center">
                    <span className="text-4xl mb-2">📋</span>
                    <p className="font-medium">No customers yet.</p>
                    <p className="text-sm mt-1">
                      Click "Add Customer" to register your first customer
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-linear-to-br from-indigo-600 to-blue-600 text-white flex items-center justify-center font-semibold text-sm shadow-md">
                        {c.fullName
                          ?.split(" ")
                          .map((n) => n?.[0])
                          .slice(0, 2)
                          .join("")}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-800">
                          {c.fullName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {c.email || "No email"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 font-mono">
                    {c.cnic}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {c.phone || "—"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {c.email || "—"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setSelectedCustomer(c);
                          setViewOpen(true);
                        }}
                        className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition font-semibold"
                        title="View"
                      >
                        <MdRemoveRedEye size={18} />
                      </button>
                      <button
                        onClick={() => handleEdit(c)}
                        className="p-2 rounded-lg hover:bg-amber-100 text-amber-600 transition font-semibold"
                        title="Edit"
                      >
                        <MdEdit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition font-semibold"
                        title="Delete"
                      >
                        <MdDelete size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 px-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-50 w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden max-h-[90vh]">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-blue-800 px-8 py-5 flex items-center justify-between border-b border-blue-900">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">{editMode ? "✏️" : "➕"}</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {editMode ? "Edit Customer" : "Add New Customer"}
                  </h2>
                  <p className="text-blue-100 text-xs mt-0.5 opacity-90">
                    {editMode
                      ? "Update customer information and documents"
                      : "Register a new customer"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setOpen(false);
                  resetForm();
                  setEditMode(false);
                }}
                className="text-white hover:bg-blue-700 p-2 rounded-lg transition duration-200"
              >
                <MdClose size={22} />
              </button>
            </div>

            {/* Scrollable Content with Fade Effect */}
            <div className="relative overflow-y-auto max-h-[calc(90vh-100px)] hide-scrollbar">
              {/* Top Fade Effect */}
              <div className="sticky top-0 h-1 bg-linear-to-b from-gray-100 to-transparent pointer-events-none" />

              <form onSubmit={handleAddOrEdit} className="p-6 space-y-6">
                {/* Personal Information Section */}
                <div className="bg-linear-to-br from-slate-50 to-blue-50 rounded-lg p-5 border border-slate-200">
                  <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4 flex items-center gap-2">
                    <span className="w-1 h-4 bg-indigo-600 rounded-full"></span>
                    Personal Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        name="fullName"
                        onChange={handleChange}
                        value={form.fullName}
                        placeholder="Enter full name"
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-2">
                        Father/Spouse Name
                      </label>
                      <input
                        name="fatherOrSpouse"
                        onChange={handleChange}
                        value={form.fatherOrSpouse}
                        placeholder="Enter father or spouse name"
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-2">
                        CNIC *
                      </label>
                      <input
                        name="cnic"
                        onChange={handleChange}
                        value={form.cnic}
                        placeholder="00000-0000000-0"
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-2">
                        Phone
                      </label>
                      <input
                        name="phone"
                        onChange={handleChange}
                        value={form.phone}
                        placeholder="0000-0000000"
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        name="email"
                        onChange={handleChange}
                        value={form.email}
                        placeholder="email@example.com"
                        type="email"
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-2">
                        Address
                      </label>
                      <input
                        name="address"
                        onChange={handleChange}
                        value={form.address}
                        placeholder="Enter residential address"
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Next of Kin Section */}
                <div className="bg-linear-to-br from-amber-50 to-orange-50 rounded-lg p-5 border border-amber-200">
                  <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4 flex items-center gap-2">
                    <span className="w-1 h-4 bg-amber-600 rounded-full"></span>
                    Next of Kin
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-2">
                        Name
                      </label>
                      <input
                        name="nokName"
                        onChange={handleChange}
                        value={form.nokName}
                        placeholder="Enter name"
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-2">
                        CNIC
                      </label>
                      <input
                        name="nokCnic"
                        onChange={handleChange}
                        value={form.nokCnic}
                        placeholder="00000-0000000-0"
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-2">
                        Phone
                      </label>
                      <input
                        name="nokPhone"
                        onChange={handleChange}
                        value={form.nokPhone}
                        placeholder="0000-0000000"
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Document Upload Section */}
                <div className="bg-linear-to-br from-green-50 to-emerald-50 rounded-lg p-5 border border-green-200">
                  <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4 flex items-center gap-2">
                    <span className="w-1 h-4 bg-green-600 rounded-full"></span>
                    Upload Documents
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Profile Photo */}
                    <div className="flex flex-col gap-3">
                      <label className="block text-xs font-semibold text-gray-700">
                        Profile Photo
                      </label>
                      <div className="relative">
                        <input
                          type="file"
                          name="profilePhoto"
                          accept="image/*"
                          onChange={handleChange}
                          className="hidden"
                          id="profilePhoto"
                        />
                        <label
                          htmlFor="profilePhoto"
                          className="block w-full px-4 py-3 border-2 border-dashed border-green-300 rounded-lg text-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition bg-white"
                        >
                          <p className="text-sm text-green-700 font-medium">
                            Click to upload
                          </p>
                          <p className="text-xs text-gray-500">
                            PNG, JPG up to 10MB
                          </p>
                        </label>
                      </div>
                      {form.profilePhoto && (
                        <div className="relative inline-block">
                          <img
                            src={getPreviewURL(form.profilePhoto)}
                            alt="Profile Preview"
                            className="w-28 h-28 object-cover rounded-lg border-2 border-green-300 shadow-sm"
                          />
                          <span className="absolute top-1 right-1 bg-green-500 text-white text-xs rounded-full px-2 py-1">
                            ✓
                          </span>
                        </div>
                      )}
                    </div>

                    {/* CNIC Front */}
                    <div className="flex flex-col gap-3">
                      <label className="block text-xs font-semibold text-gray-700">
                        CNIC Front
                      </label>
                      <div className="relative">
                        <input
                          type="file"
                          name="cnicFront"
                          accept="image/*"
                          onChange={handleChange}
                          className="hidden"
                          id="cnicFront"
                        />
                        <label
                          htmlFor="cnicFront"
                          className="block w-full px-4 py-3 border-2 border-dashed border-green-300 rounded-lg text-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition bg-white"
                        >
                          <p className="text-sm text-green-700 font-medium">
                            Click to upload
                          </p>
                          <p className="text-xs text-gray-500">
                            PNG, JPG up to 10MB
                          </p>
                        </label>
                      </div>
                      {form.cnicFront && (
                        <div className="relative inline-block">
                          <img
                            src={getPreviewURL(form.cnicFront)}
                            alt="CNIC Front"
                            className="w-40 h-24 object-cover rounded-lg border-2 border-green-300 shadow-sm"
                          />
                          <span className="absolute top-1 right-1 bg-green-500 text-white text-xs rounded-full px-2 py-1">
                            ✓
                          </span>
                        </div>
                      )}
                    </div>

                    {/* CNIC Back */}
                    <div className="flex flex-col gap-3">
                      <label className="block text-xs font-semibold text-gray-700">
                        CNIC Back
                      </label>
                      <div className="relative">
                        <input
                          type="file"
                          name="cnicBack"
                          accept="image/*"
                          onChange={handleChange}
                          className="hidden"
                          id="cnicBack"
                        />
                        <label
                          htmlFor="cnicBack"
                          className="block w-full px-4 py-3 border-2 border-dashed border-green-300 rounded-lg text-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition bg-white"
                        >
                          <p className="text-sm text-green-700 font-medium">
                            Click to upload
                          </p>
                          <p className="text-xs text-gray-500">
                            PNG, JPG up to 10MB
                          </p>
                        </label>
                      </div>
                      {form.cnicBack && (
                        <div className="relative inline-block">
                          <img
                            src={getPreviewURL(form.cnicBack)}
                            alt="CNIC Back"
                            className="w-40 h-24 object-cover rounded-lg border-2 border-green-300 shadow-sm"
                          />
                          <span className="absolute top-1 right-1 bg-green-500 text-white text-xs rounded-full px-2 py-1">
                            ✓
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Biometric */}
                    <div className="flex flex-col gap-3">
                      <label className="block text-xs font-semibold text-gray-700">
                        Biometric{" "}
                        <span className="text-gray-400">(Optional)</span>
                      </label>
                      <div className="relative">
                        <input
                          type="file"
                          name="biometric"
                          accept="image/*"
                          onChange={handleChange}
                          className="hidden"
                          id="biometric"
                        />
                        <label
                          htmlFor="biometric"
                          className="block w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition bg-white"
                        >
                          <p className="text-sm text-gray-700 font-medium">
                            Click to upload
                          </p>
                          <p className="text-xs text-gray-500">
                            PNG, JPG up to 10MB
                          </p>
                        </label>
                      </div>
                      {form.biometric && (
                        <div className="relative inline-block">
                          <img
                            src={getPreviewURL(form.biometric)}
                            alt="Biometric"
                            className="w-40 h-24 object-cover rounded-lg border-2 border-green-300 shadow-sm"
                          />
                          <span className="absolute top-1 right-1 bg-green-500 text-white text-xs rounded-full px-2 py-1">
                            ✓
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-linear-to-r from-indigo-600 to-blue-600 text-white py-3 rounded-lg hover:from-indigo-700 hover:to-blue-700 font-semibold shadow-lg hover:shadow-xl transition transform hover:scale-105"
                  >
                    {editMode ? "💾 Update Customer" : "➕ Add Customer"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      resetForm();
                      setEditMode(false);
                    }}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-semibold transition"
                  >
                    Cancel
                  </button>
                </div>

                {/* Bottom Fade Effect */}
                <div className="sticky bottom-0 h-1 bg-linear-to-t from-gray-100 to-transparent pointer-events-none" />
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 px-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setViewOpen(false)}
          />
          <div className="relative z-50 w-full max-w-4xl bg-white rounded-xl shadow-2xl border border-gray-200 overflow-y-auto max-h-[90vh] hide-scrollbar">
            <div className="sticky top-0 z-10 bg-linear-to-r from-indigo-600 to-blue-600 px-8 py-6 flex items-center justify-between border-b border-indigo-700">
              <h3 className="text-xl font-bold text-white">Customer Details</h3>
              <button
                onClick={() => setViewOpen(false)}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition"
              >
                <MdClose size={24} />
              </button>
            </div>
            <div className="p-8 space-y-6">
              {/* Personal Information Section */}
              <div className="bg-linear-to-br from-slate-50 to-blue-50 rounded-lg p-6 border border-slate-200">
                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <span className="w-1 h-4 bg-indigo-600 rounded-full"></span>
                  Personal Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                      Name
                    </p>
                    <p className="text-lg font-semibold text-slate-800">
                      {selectedCustomer?.fullName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                      Father/Spouse
                    </p>
                    <p className="text-lg font-semibold text-slate-800">
                      {selectedCustomer?.fatherOrSpouse}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                      CNIC
                    </p>
                    <p className="text-lg font-mono text-slate-800">
                      {selectedCustomer?.cnic}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                      Phone
                    </p>
                    <p className="text-lg text-slate-800">
                      {selectedCustomer?.phone || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                      Email
                    </p>
                    <p className="text-lg text-slate-800">
                      {selectedCustomer?.email || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                      Address
                    </p>
                    <p className="text-lg text-slate-800">
                      {selectedCustomer?.address || "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Next of Kin Section */}
              <div className="bg-linear-to-br from-amber-50 to-orange-50 rounded-lg p-6 border border-amber-200">
                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <span className="w-1 h-4 bg-amber-600 rounded-full"></span>
                  Next of Kin
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                      Name
                    </p>
                    <p className="text-lg font-semibold text-slate-800">
                      {selectedCustomer?.nokName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                      CNIC
                    </p>
                    <p className="text-lg font-mono text-slate-800">
                      {selectedCustomer?.nokCnic}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                      Phone
                    </p>
                    <p className="text-lg text-slate-800">
                      {selectedCustomer?.nokPhone}
                    </p>
                  </div>
                </div>
              </div>

              {/* Uploaded Documents */}
              {(selectedCustomer?.profilePhoto ||
                selectedCustomer?.cnicFront ||
                selectedCustomer?.cnicBack ||
                selectedCustomer?.biometric) && (
                <div className="bg-linear-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
                  <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4 flex items-center gap-2">
                    <span className="w-1 h-4 bg-green-600 rounded-full"></span>
                    Uploaded Documents
                  </h4>
                  <div className="flex flex-wrap gap-4">
                    {selectedCustomer?.profilePhoto && (
                      <div className="relative">
                        <img
                          src={getPreviewURL(selectedCustomer.profilePhoto)}
                          alt="Profile"
                          className="w-24 h-24 object-cover rounded-lg border-2 border-green-300 shadow-sm"
                        />
                        <span className="absolute bottom-1 right-1 text-xs bg-green-500 text-white px-2 py-1 rounded">
                          Profile
                        </span>
                      </div>
                    )}
                    {selectedCustomer?.cnicFront && (
                      <div className="relative">
                        <img
                          src={getPreviewURL(selectedCustomer.cnicFront)}
                          alt="CNIC Front"
                          className="w-32 h-20 object-cover rounded-lg border-2 border-green-300 shadow-sm"
                        />
                        <span className="absolute bottom-1 right-1 text-xs bg-green-500 text-white px-2 py-1 rounded">
                          Front
                        </span>
                      </div>
                    )}
                    {selectedCustomer?.cnicBack && (
                      <div className="relative">
                        <img
                          src={getPreviewURL(selectedCustomer.cnicBack)}
                          alt="CNIC Back"
                          className="w-32 h-20 object-cover rounded-lg border-2 border-green-300 shadow-sm"
                        />
                        <span className="absolute bottom-1 right-1 text-xs bg-green-500 text-white px-2 py-1 rounded">
                          Back
                        </span>
                      </div>
                    )}
                    {selectedCustomer?.biometric && (
                      <div className="relative">
                        <img
                          src={getPreviewURL(selectedCustomer.biometric)}
                          alt="Biometric"
                          className="w-32 h-20 object-cover rounded-lg border-2 border-green-300 shadow-sm"
                        />
                        <span className="absolute bottom-1 right-1 text-xs bg-green-500 text-white px-2 py-1 rounded">
                          Biometric
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
