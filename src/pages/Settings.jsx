// pages/Settings.jsx
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import toast, { Toaster } from "react-hot-toast";
import { updateSettings, addBlock, removeBlock, setLogo } from "../features/SettingsSlice.jsx";

const readFile = (file) => new Promise((res, rej) => {
  const fr = new FileReader();
  fr.onload = () => res(fr.result);
  fr.onerror = rej;
  fr.readAsDataURL(file);
});

export default function Settings() {
  const dispatch = useDispatch();
  const settings = useSelector(s => s.settings ?? {});
  const [societyName, setSocietyName] = useState(settings.societyName || "");
  const [adminName, setAdminName] = useState(settings.admin?.name || "");
  const [adminEmail, setAdminEmail] = useState(settings.admin?.email || "");
  const [newBlock, setNewBlock] = useState("");
  const [logoPreview, setLogoPreview] = useState(settings.logo || null);

  useEffect(()=> {
    setSocietyName(settings.societyName || "");
    setAdminName(settings.admin?.name || "");
    setAdminEmail(settings.admin?.email || "");
    setLogoPreview(settings.logo || null);
  }, [settings]);

  const handleLogo = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!/image\/(png|jpeg|jpg)/.test(f.type)) return toast.error("Logo must be PNG/JPG/JPEG");
    const data = await readFile(f);
    setLogoPreview(data);
    dispatch(setLogo(data));
    toast.success("Logo updated");
  };

  const save = () => {
    if (!societyName.trim()) return toast.error("Society name required");
    dispatch(updateSettings({ societyName, admin: { name: adminName, email: adminEmail } }));
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
    <div className="p-6">
      <Toaster position="top-right" />
      <h2 className="text-2xl font-semibold mb-4">Settings</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow col-span-2">
          <label className="block text-sm font-medium">Society Name</label>
          <input className="w-full border p-2 rounded mb-3" value={societyName} onChange={(e)=>setSocietyName(e.target.value)} />

          <label className="block text-sm font-medium">Admin Name</label>
          <input className="w-full border p-2 rounded mb-3" value={adminName} onChange={(e)=>setAdminName(e.target.value)} />

          <label className="block text-sm font-medium">Admin Email</label>
          <input className="w-full border p-2 rounded mb-3" value={adminEmail} onChange={(e)=>setAdminEmail(e.target.value)} />

          <div className="flex gap-3">
            <button onClick={save} className="bg-indigo-600 text-white px-4 py-2 rounded">Save</button>
            <button onClick={()=>{ setSocietyName(settings.societyName); setAdminName(settings.admin?.name || ""); setAdminEmail(settings.admin?.email || ""); setLogoPreview(settings.logo || null); }} className="bg-gray-100 px-4 py-2 rounded">Reset</button>
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <label className="block text-sm font-medium">Logo</label>
          {logoPreview ? <img src={logoPreview} alt="logo" className="w-32 h-32 object-contain mb-2" /> : <div className="w-32 h-32 bg-gray-100 mb-2 flex items-center justify-center">No logo</div>}
          <input type="file" accept="image/*" onChange={handleLogo} />
        </div>
      </div>

      {/* Blocks & payment plans */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h4 className="font-semibold mb-2">Blocks</h4>
          <div className="flex gap-2 mb-3">
            <input className="border p-2 rounded w-full" value={newBlock} onChange={(e)=>setNewBlock(e.target.value)} placeholder="Add block (e.g. D)" />
            <button onClick={addNewBlock} className="bg-green-600 text-white px-3 rounded">Add</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {settings.blocks?.map(b => (
              <div key={b} className="px-3 py-1 bg-gray-100 rounded flex items-center gap-2">
                <span>{b}</span>
                <button onClick={()=>{ dispatch(removeBlock(b)); toast.success("Removed") }} className="text-red-600">x</button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h4 className="font-semibold mb-2">Payment Plans & Roles</h4>
          <div className="text-sm text-gray-600 mb-1">Payment Plans</div>
          <div className="flex flex-wrap gap-2 mb-3">
            {settings.paymentPlans?.map(plan => <div key={plan} className="px-3 py-1 bg-gray-100 rounded">{plan}</div>)}
          </div>
          <div className="text-sm text-gray-600 mb-1">Roles</div>
          <div className="flex flex-wrap gap-2">
            {settings.roles?.map(role => <div key={role} className="px-3 py-1 bg-gray-100 rounded">{role}</div>)}
          </div>
        </div>
      </div>
    </div>
  );
}
