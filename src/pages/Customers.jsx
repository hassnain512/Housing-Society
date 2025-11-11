import React, { useState } from "react";
import { MdAdd, MdClose, MdEdit, MdDelete, MdRemoveRedEye } from "react-icons/md";
import { useSelector, useDispatch } from "react-redux";
import toast, { Toaster } from "react-hot-toast";
import { addCustomer, updateCustomer, deleteCustomer } from "../features/CustomersSlice.jsx";

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
      dispatch(updateCustomer({ id: selectedCustomer.id, updatedData: customerData }));
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
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-3">
        <h2 className="text-2xl font-bold text-slate-800">Customers — List</h2>
        <button
          onClick={() => {
            resetForm();
            setEditMode(false);
            setOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700"
        >
          <MdAdd />
          Add Customer
        </button>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
        <table className="min-w-full divide-y">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm text-gray-600">Name</th>
              <th className="px-4 py-3 text-left text-sm text-gray-600">CNIC</th>
              <th className="px-4 py-3 text-left text-sm text-gray-600">Phone</th>
              <th className="px-4 py-3 text-left text-sm text-gray-600">Email</th>
              <th className="px-4 py-3 text-right text-sm text-gray-600 pr-6">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y">
            {customers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  No customers yet.
                </td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-medium">
                        {c.fullName?.split(" ").map((n) => n?.[0]).slice(0, 2).join("")}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-800">{c.fullName}</div>
                        <div className="text-xs text-gray-400">{c.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">{c.cnic}</td>
                  <td className="px-4 py-4 text-sm text-gray-600">{c.phone || "—"}</td>
                  <td className="px-4 py-4 text-sm text-gray-600">{c.email || "—"}</td>
                  <td className="px-4 py-4 text-right flex justify-end gap-2 pr-4">
                    <button onClick={() => { setSelectedCustomer(c); setViewOpen(true); }} className="p-2 rounded-md hover:bg-gray-100 text-blue-600"><MdRemoveRedEye size={18} /></button>
                    <button onClick={() => handleEdit(c)} className="p-2 rounded-md hover:bg-gray-100 text-yellow-600"><MdEdit size={18} /></button>
                    <button onClick={() => handleDelete(c.id)} className="p-2 rounded-md hover:bg-gray-100 text-red-600"><MdDelete size={18} /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-5 px-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative z-50 w-full max-w-3xl bg-white rounded-lg shadow-lg border p-6 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">{editMode ? "Edit Customer" : "Add Customer"}</h3>
              <button onClick={() => { setOpen(false); resetForm(); setEditMode(false); }} className="text-gray-500 hover:bg-gray-100 p-2 rounded"><MdClose size={20} /></button>
            </div>

            <form onSubmit={handleAddOrEdit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input name="fullName" onChange={handleChange} value={form.fullName} placeholder="Full Name" className="border p-3 rounded" />
              <input name="fatherOrSpouse" onChange={handleChange} value={form.fatherOrSpouse} placeholder="Father/Spouse Name" className="border p-3 rounded" />
              <input name="cnic" onChange={handleChange} value={form.cnic} placeholder="CNIC" className="border p-3 rounded" />
              <input name="phone" onChange={handleChange} value={form.phone} placeholder="Phone" className="border p-3 rounded" />
              <input name="email" onChange={handleChange} value={form.email} placeholder="Email" className="border p-3 rounded" />
              <input name="address" onChange={handleChange} value={form.address} placeholder="Address" className="border p-3 rounded md:col-span-2" />

              <h4 className="text-sm font-semibold text-slate-700 mt-2 md:col-span-2">Next of Kin</h4>
              <input name="nokName" onChange={handleChange} value={form.nokName} placeholder="Name" className="border p-3 rounded" />
              <input name="nokCnic" onChange={handleChange} value={form.nokCnic} placeholder="CNIC" className="border p-3 rounded" />
              <input name="nokPhone" onChange={handleChange} value={form.nokPhone} placeholder="Phone" className="border p-3 rounded" />

              <h4 className="text-sm font-semibold text-slate-700 mt-2 md:col-span-2">Upload Files</h4>
              <div className="flex flex-col gap-2">
                <label>Profile Photo</label>
                <input type="file" name="profilePhoto" accept="image/*" onChange={handleChange} className="border p-2 rounded" />
                {form.profilePhoto && <img src={getPreviewURL(form.profilePhoto)} alt="Profile Preview" className="w-24 h-24 object-cover rounded mt-1 border" />}
              </div>

              <div className="flex flex-col gap-2">
                <label>CNIC Front</label>
                <input type="file" name="cnicFront" accept="image/*" onChange={handleChange} className="border p-2 rounded" />
                {form.cnicFront && <img src={getPreviewURL(form.cnicFront)} alt="CNIC Front" className="w-32 h-20 object-cover rounded mt-1 border" />}
              </div>

              <div className="flex flex-col gap-2">
                <label>CNIC Back</label>
                <input type="file" name="cnicBack" accept="image/*" onChange={handleChange} className="border p-2 rounded" />
                {form.cnicBack && <img src={getPreviewURL(form.cnicBack)} alt="CNIC Back" className="w-32 h-20 object-cover rounded mt-1 border" />}
              </div>

              <div className="flex flex-col gap-2">
                <label>Biometric (Optional)</label>
                <input type="file" name="biometric" accept="image/*" onChange={handleChange} className="border p-2 rounded" />
                {form.biometric && <img src={getPreviewURL(form.biometric)} alt="Biometric" className="w-32 h-20 object-cover rounded mt-1 border" />}
              </div>

              <button type="submit" className="mt-4 bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 md:col-span-2">
                {editMode ? "Update Customer" : "Add Customer"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setViewOpen(false)} />
          <div className="relative z-50 w-full max-w-3xl bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Customer Details</h3>
              <button onClick={() => setViewOpen(false)} className="text-gray-500 hover:bg-gray-100 p-2 rounded"><MdClose size={20} /></button>
            </div>
            <div className="space-y-2 text-sm text-slate-700">
              <p><strong>Name:</strong> {selectedCustomer.fullName}</p>
              <p><strong>Father/Spouse:</strong> {selectedCustomer.fatherOrSpouse}</p>
              <p><strong>CNIC:</strong> {selectedCustomer.cnic}</p>
              <p><strong>Phone:</strong> {selectedCustomer.phone || "—"}</p>
              <p><strong>Email:</strong> {selectedCustomer.email || "—"}</p>
              <p><strong>Address:</strong> {selectedCustomer.address || "—"}</p>
              <hr />
              <p className="font-semibold">Next of Kin</p>
              <p><strong>Name:</strong> {selectedCustomer.nokName}</p>
              <p><strong>CNIC:</strong> {selectedCustomer.nokCnic}</p>
              <p><strong>Phone:</strong> {selectedCustomer.nokPhone}</p>
              <hr />
              <p className="font-semibold">Uploaded Files</p>
              <div className="flex flex-wrap gap-3 mt-1">
                {selectedCustomer.profilePhoto && <img src={getPreviewURL(selectedCustomer.profilePhoto)} alt="Profile" className="w-24 h-24 object-cover rounded border" />}
                {selectedCustomer.cnicFront && <img src={getPreviewURL(selectedCustomer.cnicFront)} alt="CNIC Front" className="w-32 h-20 object-cover rounded border" />}
                {selectedCustomer.cnicBack && <img src={getPreviewURL(selectedCustomer.cnicBack)} alt="CNIC Back" className="w-32 h-20 object-cover rounded border" />}
                {selectedCustomer.biometric && <img src={getPreviewURL(selectedCustomer.biometric)} alt="Biometric" className="w-32 h-20 object-cover rounded border" />}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
