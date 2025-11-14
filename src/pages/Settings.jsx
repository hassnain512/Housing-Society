// pages/Settings.jsx
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import toast, { Toaster } from "react-hot-toast";
import {
  updateSettings,
  addBlock,
  removeBlock,
  setLogo,
  setAdminPhoto,
} from "../features/SettingsSlice.jsx";
import { MdUpload, MdClose, MdCheckCircle } from "react-icons/md";

const readFile = (file) =>
  new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => res(fr.result);
    fr.onerror = rej;
    fr.readAsDataURL(file);
  });

export default function Settings() {
  const dispatch = useDispatch();
  const settings = useSelector((s) => s.settings ?? {});
  const [societyName, setSocietyName] = useState(settings.societyName || "");
  const [adminName, setAdminName] = useState(settings.admin?.name || "");
  const [adminEmail, setAdminEmail] = useState(settings.admin?.email || "");
  const [newBlock, setNewBlock] = useState("");
  const [logoPreview, setLogoPreview] = useState(settings.logo || null);
  const [adminPhotoPreview, setAdminPhotoPreview] = useState(
    settings.admin?.photo || null
  );

  useEffect(() => {
    setSocietyName(settings.societyName || "");
    setAdminName(settings.admin?.name || "");
    setAdminEmail(settings.admin?.email || "");
    setLogoPreview(settings.logo || null);
    setAdminPhotoPreview(settings.admin?.photo || null);
  }, [settings]);

  const handleLogo = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!/image\/(png|jpeg|jpg)/.test(f.type))
      return toast.error("Logo must be PNG/JPG/JPEG");
    const data = await readFile(f);
    setLogoPreview(data);
    dispatch(setLogo(data));
    toast.success("Logo updated");
  };

  const handleAdminPhoto = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!/image\/(png|jpeg|jpg)/.test(f.type))
      return toast.error("Photo must be PNG/JPG/JPEG");
    const data = await readFile(f);
    setAdminPhotoPreview(data);
    dispatch(setAdminPhoto(data));
    toast.success("Admin photo updated");
  };

  const save = () => {
    if (!societyName.trim()) return toast.error("Society name required");
    dispatch(
      updateSettings({
        societyName,
        admin: { name: adminName, email: adminEmail },
      })
    );
    toast.success("Settings saved");
  };

  const addNewBlock = () => {
    if (!newBlock.trim()) return;
    const b = newBlock.trim().toUpperCase();
    dispatch(addBlock(b));
    setNewBlock("");
    toast.success("Block added");
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Settings</h1>
        <p className="text-gray-600">
          Configure your society and manage administrator details
        </p>
      </div>

      {/* Organization Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Society Info Section */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-2">
            <span className="w-1 h-6 bg-indigo-600 rounded-full"></span>
            Organization Details
          </h3>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Society Name
              </label>
              <input
                className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                placeholder="Enter society name"
                value={societyName}
                onChange={(e) => setSocietyName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Admin Name
              </label>
              <input
                className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                placeholder="Administrator name"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Admin Email
              </label>
              <input
                className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                placeholder="admin@example.com"
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-3 mt-8 pt-8 border-t border-gray-200">
            <button
              onClick={save}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-linear-to-r from-indigo-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition transform hover:scale-105"
            >
              <MdCheckCircle size={20} />
              Save Changes
            </button>
            <button
              onClick={() => {
                setSocietyName(settings.societyName);
                setAdminName(settings.admin?.name || "");
                setAdminEmail(settings.admin?.email || "");
                setLogoPreview(settings.logo || null);
              }}
              className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 font-semibold transition"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Media Section */}
        <div className="space-y-6">
          {/* Logo Upload */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-5 flex items-center gap-2">
              <span className="w-1 h-4 bg-indigo-600 rounded-full"></span>
              Logo
            </h3>
            <div className="mb-5">
              {logoPreview ? (
                <div className="relative group">
                  <img
                    src={logoPreview}
                    alt="logo"
                    className="w-full h-40 object-contain bg-linear-to-br from-slate-50 to-slate-100 rounded-lg border-2 border-indigo-200 p-3 shadow-sm"
                  />
                  <button
                    onClick={() => {
                      setLogoPreview(null);
                      dispatch(setLogo(null));
                    }}
                    className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                  >
                    <MdClose size={16} />
                  </button>
                </div>
              ) : (
                <div className="w-full h-40 bg-linear-to-br from-slate-50 to-slate-100 rounded-lg border-2 border-dashed border-indigo-300 flex items-center justify-center hover:border-indigo-500 transition">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📦</div>
                    <p className="text-sm font-medium text-gray-600">
                      Click to upload logo
                    </p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, JPEG</p>
                  </div>
                </div>
              )}
            </div>
            <label className="block cursor-pointer">
              <span className="sr-only">Upload logo</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogo}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition"
              />
            </label>
          </div>

          {/* Admin Photo Upload */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-5 flex items-center gap-2">
              <span className="w-1 h-4 bg-amber-600 rounded-full"></span>
              Admin Photo
            </h3>
            <div className="mb-5">
              {adminPhotoPreview ? (
                <div className="relative group">
                  <img
                    src={adminPhotoPreview}
                    alt="admin"
                    className="w-full h-40 object-cover rounded-lg border-2 border-amber-200 shadow-sm"
                  />
                  <button
                    onClick={() => {
                      setAdminPhotoPreview(null);
                      dispatch(setAdminPhoto(null));
                    }}
                    className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                  >
                    <MdClose size={16} />
                  </button>
                </div>
              ) : (
                <div className="w-full h-40 bg-linear-to-br from-slate-50 to-slate-100 rounded-lg border-2 border-dashed border-amber-300 flex items-center justify-center hover:border-amber-500 transition">
                  <div className="text-center">
                    <div className="text-4xl mb-2">👤</div>
                    <p className="text-sm font-medium text-gray-600">
                      Click to upload photo
                    </p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, JPEG</p>
                  </div>
                </div>
              )}
            </div>
            <label className="block cursor-pointer">
              <span className="sr-only">Upload admin photo</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleAdminPhoto}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 transition"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Configuration Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Blocks Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-2">
            <span className="w-1 h-6 bg-green-600 rounded-full"></span>
            Residential Blocks
          </h3>

          <div className="flex gap-3 mb-6">
            <input
              className="flex-1 border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
              value={newBlock}
              onChange={(e) => setNewBlock(e.target.value)}
              placeholder="Add block (e.g., D)"
              onKeyPress={(e) => e.key === "Enter" && addNewBlock()}
            />
            <button
              onClick={addNewBlock}
              className="bg-linear-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition transform hover:scale-105"
            >
              Add
            </button>
          </div>

          <div className="space-y-2">
            {settings.blocks?.length > 0 ? (
              settings.blocks.map((b) => (
                <div
                  key={b}
                  className="px-4 py-3 bg-linear-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg flex items-center justify-between hover:from-green-100 hover:to-emerald-100 transition group"
                >
                  <span className="font-semibold text-green-700">{b}</span>
                  <button
                    onClick={() => {
                      dispatch(removeBlock(b));
                      toast.success("Block removed");
                    }}
                    className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition"
                  >
                    <MdClose size={18} />
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500 text-sm">No blocks added yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Configuration Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-2">
            <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
            Configuration
          </h3>

          <div className="space-y-8">
            {/* Payment Plans */}
            <div>
              <div className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4 flex items-center gap-2">
                <span className="w-1 h-4 bg-blue-600 rounded-full"></span>
                Payment Plans
              </div>
              {settings.paymentPlans?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {settings.paymentPlans.map((plan) => (
                    <span
                      key={plan}
                      className="px-4 py-2 bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg text-blue-700 font-semibold"
                    >
                      {plan}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 text-sm">
                    No payment plans configured
                  </p>
                </div>
              )}
            </div>

            {/* Roles */}
            <div>
              <div className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4 flex items-center gap-2">
                <span className="w-1 h-4 bg-purple-600 rounded-full"></span>
                User Roles
              </div>
              {settings.roles?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {settings.roles.map((role) => (
                    <span
                      key={role}
                      className="px-4 py-2 bg-linear-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg text-purple-700 font-semibold"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 text-sm">No roles configured</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
