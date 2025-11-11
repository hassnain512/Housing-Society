// pages/Reports.jsx
import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { parseISO, format } from "date-fns";
import toast, { Toaster } from "react-hot-toast";

export default function Reports() {
  const plots = useSelector(s => s.plots.plots ?? []);
  const customers = useSelector(s => s.customers.list ?? []);
  const bookings = useSelector(s => s.bookings.list ?? []);
  const reacqs = useSelector(s => s.reacquisition.list ?? []);
  const [monthFilter, setMonthFilter] = useState("all");

  const totals = useMemo(() => {
    const totalPlots = plots.length;
    const available = plots.filter(p => p.status === "Available").length;
    const sold = totalPlots - available;
    const revenue = bookings.reduce((s,b)=> s + (Number(b.price || 0)), 0) + reacqs.reduce((s,r)=> s + (Number(r.price||0)), 0);
    return { totalPlots, available, sold, revenue };
  }, [plots, bookings, reacqs]);

  // customer list
  const customerList = customers.map(c => ({ id: c.id, name: c.fullName, cnic: c.cnic, phone: c.phone }));

  // monthly sales (from bookings + reacquisitions createdAt)
  const monthly = useMemo(() => {
    const sums = {};
    const push = (dateStr, amount) => {
      const d = dateStr ? new Date(dateStr) : new Date();
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
      sums[key] = (sums[key] || 0) + Number(amount || 0);
    };
    bookings.forEach(b => push(b.createdAt, b.price));
    reacqs.forEach(r => push(r.createdAt, r.price));
    return sums;
  }, [bookings, reacqs]);

  const exportCustomersCSV = () => {
    const rows = ["id,name,cnic,phone"];
    customerList.forEach(c => rows.push([c.id, `"${c.name}"`, c.cnic, c.phone].join(",")));
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "customers.csv"; a.click();
  };

  return (
    <div className="p-6">
      <Toaster position="top-right" />
      <h2 className="text-2xl font-semibold mb-4">Reports</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500">Total Plots</div>
          <div className="text-2xl font-bold">{totals.totalPlots}</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500">Available</div>
          <div className="text-2xl font-bold text-green-600">{totals.available}</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500">Sold/Booked</div>
          <div className="text-2xl font-bold text-red-600">{totals.sold}</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500">Total Revenue (PKR)</div>
          <div className="text-2xl font-bold text-indigo-600">{Number(totals.revenue).toLocaleString()}</div>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold">Customer List</h3>
          <button onClick={exportCustomersCSV} className="text-sm px-3 py-1 bg-gray-100 rounded">Export CSV</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2">Name</th>
                <th className="p-2">CNIC</th>
                <th className="p-2">Phone</th>
              </tr>
            </thead>
            <tbody>
              {customerList.map(c => (
                <tr key={c.id} className="border-t hover:bg-gray-50">
                  <td className="p-2">{c.name}</td>
                  <td className="p-2">{c.cnic}</td>
                  <td className="p-2">{c.phone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-3">Monthly Sales (Bookings + Reacquisitions)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr><th className="p-2">Month</th><th className="p-2">Amount (PKR)</th></tr>
            </thead>
            <tbody>
              {Object.keys(monthly).length === 0 ? <tr><td colSpan={2} className="p-3 text-gray-500">No data</td></tr> : Object.entries(monthly).map(([k,v])=>(
                <tr key={k} className="border-t hover:bg-gray-50">
                  <td className="p-2">{k}</td>
                  <td className="p-2">{Number(v).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
