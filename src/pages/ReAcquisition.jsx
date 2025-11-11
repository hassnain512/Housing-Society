// pages/Reacquisition.jsx
import React, { useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import toast, { Toaster } from "react-hot-toast";
import { addReacquisition, updateReacquisition, setStatus, removeReacquisition } from "../features/ReacquisitionSlice.jsx";

const readFileAsBase64 = (file) => new Promise((res, rej) => {
  const fr = new FileReader();
  fr.onload = () => res(fr.result);
  fr.onerror = rej;
  fr.readAsDataURL(file);
});

export default function Reacquisition() {
  const dispatch = useDispatch();
  const plots = useSelector(s => s.plots.plots ?? []);
  const customers = useSelector(s => s.customers.list ?? []);
  const reacqs = useSelector(s => s.reacquisition.list ?? []);
  const [selectedPlotId, setSelectedPlotId] = useState("");
  const [price, setPrice] = useState("");
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [receiptFile, setReceiptFile] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const selectedPlot = plots.find(p => p.id === Number(selectedPlotId));
  const owner = selectedPlot ? customers.find(c => c.id === selectedPlot.ownerId || c.plotId === selectedPlot.id) : null;

  const eligiblePlots = plots.filter(p => p.status !== "Available"); // only owned plots recommended, but you can choose

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
    if (!selectedPlot) { toast.error("Choose a plot"); return false; }
    if (!owner) { toast.error("Plot owner not found"); return false; }
    if (!price || Number(price) <= 0) { toast.error("Enter valid price"); return false; }
    if (!paymentMode) { toast.error("Choose payment mode"); return false; }
    return true;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const payload = {
      id: Date.now(),
      plotId: selectedPlot.id,
      plotNumber: selectedPlot.plotNumber,
      block: selectedPlot.block,
      ownerId: owner.id,
      ownerName: owner.fullName,
      ownerCnic: owner.cnic,
      price: Number(price),
      paymentMode,
      receiptFile, // base64
      remarks,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    dispatch(addReacquisition(payload));
    toast.success("Reacquisition submitted for approval");
    // reset
    setSelectedPlotId("");
    setPrice("");
    setPaymentMode("Cash");
    setReceiptFile(null);
    setRemarks("");
  };

  const handleApprove = (r) => {
    dispatch(setStatus({ id: r.id, status: "approved" }));
    toast.success("Approved");
  };
  const handleReject = (r) => {
    dispatch(setStatus({ id: r.id, status: "rejected" }));
    toast("Rejected", { icon: "⚠️" });
  };

  // simple CSV export
  const exportCSV = () => {
    const rows = ["id,plotNumber,block,ownerName,price,status,createdAt"];
    reacqs.forEach(r => {
      rows.push([r.id, r.plotNumber, r.block, `"${r.ownerName}"`, r.price, r.status, r.createdAt].join(","));
    });
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "reacquisitions.csv"; a.click();
  };

  const visible = reacqs.filter(r => filterStatus === "all" ? true : r.status === filterStatus);

  return (
    <div className="p-6">
      <Toaster position="top-right" />
      <h2 className="text-2xl font-semibold mb-4">Re-Acquisition (Advanced)</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="md:col-span-2 bg-white p-4 rounded shadow">
          <label className="block text-sm font-medium mb-2">Select Plot</label>
          <select className="w-full border p-2 rounded mb-3" value={selectedPlotId} onChange={(e) => setSelectedPlotId(e.target.value)}>
            <option value="">-- Choose plot --</option>
            {eligiblePlots.map(p => <option key={p.id} value={p.id}>{p.block} - {p.plotNumber} ({p.size}) — {p.status}</option>)}
          </select>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input type="number" placeholder="Reacquisition Price (PKR)" value={price} onChange={(e) => setPrice(e.target.value)} className="border p-2 rounded" />
            <select value={paymentMode} onChange={(e)=>setPaymentMode(e.target.value)} className="border p-2 rounded">
              <option>Cash</option>
              <option>Bank Transfer</option>
              <option>Cheque</option>
              <option>Other</option>
            </select>
          </div>

          <label className="block mt-3 text-sm">Upload Receipt (optional)</label>
          <input type="file" accept="image/png, image/jpeg" onChange={handleFile} className="mt-2" />

          <textarea placeholder="Remarks (optional)" value={remarks} onChange={(e)=>setRemarks(e.target.value)} className="w-full border p-2 rounded mt-3" rows={3} />

          <div className="flex justify-end gap-3 mt-4">
            <button onClick={handleSubmit} className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">Submit</button>
            <button onClick={()=>{setSelectedPlotId(""); setPrice(""); setReceiptFile(null); setRemarks("");}} className="bg-gray-200 px-4 py-2 rounded">Reset</button>
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h4 className="font-semibold mb-2">Selected Owner</h4>
          {!selectedPlot ? <p className="text-gray-500">Choose a plot to see owner</p> : owner ? (
            <div>
              <p><b>{owner.fullName}</b></p>
              <p className="text-sm text-gray-600">CNIC: {owner.cnic}</p>
              <p className="text-sm text-gray-600">Phone: {owner.phone}</p>
            </div>
          ) : <p className="text-sm text-gray-500">Owner record not found</p>}
        </div>
      </div>

      {/* List */}
      <div className="bg-white p-4 rounded shadow">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold">Requests</h3>
          <div className="flex items-center gap-2">
            <select value={filterStatus} onChange={(e)=>setFilterStatus(e.target.value)} className="border p-1 rounded">
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <button onClick={exportCSV} className="text-sm px-3 py-1 bg-gray-100 rounded">Export CSV</button>
          </div>
        </div>

        {visible.length === 0 ? <p className="text-center text-gray-500 py-6">No requests</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-2 text-left">Plot</th>
                  <th className="p-2 text-left">Owner</th>
                  <th className="p-2 text-left">Price</th>
                  <th className="p-2 text-left">Mode</th>
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map(r => (
                  <tr key={r.id} className="border-t hover:bg-gray-50">
                    <td className="p-2">{r.block}-{r.plotNumber}</td>
                    <td className="p-2">{r.ownerName}</td>
                    <td className="p-2">PKR {Number(r.price).toLocaleString()}</td>
                    <td className="p-2">{r.paymentMode}</td>
                    <td className="p-2 capitalize">{r.status}</td>
                    <td className="p-2 flex gap-2">
                      {r.status === "pending" && <>
                        <button onClick={()=>handleApprove(r)} className="text-green-600 px-2 py-1 rounded border">Approve</button>
                        <button onClick={()=>handleReject(r)} className="text-yellow-700 px-2 py-1 rounded border">Reject</button>
                      </>}
                      <button onClick={()=>{dispatch(removeReacquisition(r.id)); toast.success("Deleted")}} className="text-red-600 px-2 py-1 rounded border">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
