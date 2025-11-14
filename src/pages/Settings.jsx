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
import { MdUpload, MdClose, MdAdd, MdCheckCircle } from "react-icons/md";

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
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Settings</h2>
        <p className="text-gray-500">
          Manage your society configuration and administrator details
        </p>
      </div>

      {/* Organization Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Society Info Section */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">
            Organization Details
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Society Name
              </label>
              <input
                className="w-full border border-gray-200 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                placeholder="Enter society name"
                value={societyName}
                onChange={(e) => setSocietyName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Name
              </label>
              <input
                className="w-full border border-gray-200 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                placeholder="Administrator name"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Email
              </label>
              <input
                className="w-full border border-gray-200 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                placeholder="admin@example.com"
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={save}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
            >
              <MdCheckCircle size={18} />
              Save Changes
            </button>
            <button
              onClick={() => {
                setSocietyName(settings.societyName);
                setAdminName(settings.admin?.name || "");
                setAdminEmail(settings.admin?.email || "");
                setLogoPreview(settings.logo || null);
              }}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg font-medium transition-colors"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Media Section */}
        <div className="space-y-6">
          {/* Logo Upload */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <MdUpload size={18} />
              Logo
            </h3>
            <div className="mb-4">
              {logoPreview ? (
                <div className="relative group">
                  <img
                    src={logoPreview}
                    alt="logo"
                    className="w-full h-40 object-contain bg-gray-50 rounded-lg border border-gray-200 p-2"
                  />
                  <button
                    onClick={() => {
                      setLogoPreview(null);
                      dispatch(setLogo(null));
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MdClose size={16} />
                  </button>
                </div>
              ) : (
                <div className="w-full h-40 bg-linear-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <div className="text-center">
                    <MdUpload
                      className="mx-auto text-gray-400 mb-2"
                      size={32}
                    />
                    <p className="text-sm text-gray-500">No logo</p>
                  </div>
                </div>
              )}
            </div>
            <label className="block">
              <span className="sr-only">Upload logo</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogo}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
            </label>
          </div>

          {/* Admin Photo Upload */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <MdUpload size={18} />
              Admin Photo
            </h3>
            <div className="mb-4">
              {adminPhotoPreview ? (
                <div className="relative group">
                  <img
                    src={adminPhotoPreview}
                    alt="admin"
                    className="w-full h-40 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    onClick={() => {
                      setAdminPhotoPreview(null);
                      dispatch(setAdminPhoto(null));
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MdClose size={16} />
                  </button>
                </div>
              ) : (
                <div className="w-full h-40 bg-linear-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <div className="text-center">
                    <MdUpload
                      className="mx-auto text-gray-400 mb-2"
                      size={32}
                    />
                    <p className="text-sm text-gray-500">No photo</p>
                  </div>
                </div>
              )}
            </div>
            <label className="block">
              <span className="sr-only">Upload admin photo</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleAdminPhoto}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Configuration Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Blocks Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">
            Residential Blocks
          </h3>

          <div className="flex gap-2 mb-6">
            <input
              className="flex-1 border border-gray-200 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              value={newBlock}
              onChange={(e) => setNewBlock(e.target.value)}
              placeholder="Add block (e.g. D)"
              onKeyPress={(e) => e.key === "Enter" && addNewBlock()}
            />
            <button
              onClick={addNewBlock}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <MdAdd size={18} />
              Add
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {settings.blocks?.map((b) => (
              <div
                key={b}
                className="px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-lg flex items-center gap-2 text-indigo-700 font-medium hover:bg-indigo-100 transition-colors"
              >
                <span>{b}</span>
                <button
                  onClick={() => {
                    dispatch(removeBlock(b));
                    toast.success("Block removed");
                  }}
                  className="ml-1 text-indigo-500 hover:text-red-600"
                >
                  <MdClose size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Plans & Roles Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">
            Configuration
          </h3>

          <div className="space-y-6">
            <div>
              <div className="text-sm font-medium text-gray-700 mb-3">
                Payment Plans
              </div>
              <div className="flex flex-wrap gap-2">
                {settings.paymentPlans?.map((plan) => (
                  <span
                    key={plan}
                    className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 font-medium"
                  >
                    {plan}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div className="text-sm font-medium text-gray-700 mb-3">
                Roles
              </div>
              <div className="flex flex-wrap gap-2">
                {settings.roles?.map((role) => (
                  <span
                    key={role}
                    className="px-4 py-2 bg-purple-50 border border-purple-200 rounded-lg text-purple-700 font-medium"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
