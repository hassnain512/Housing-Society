import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { MdDownload, MdFileDownload, MdTrendingUp } from "react-icons/md";
import toast, { Toaster } from "react-hot-toast";

export default function Reports() {
  const plots = useSelector(s => s.plots.plots ?? []);
  const customers = useSelector(s => s.customers.list ?? []);
  const bookings = useSelector(s => s.bookings.list ?? []);
  const reacqs = useSelector(s => s.reacquisition.list ?? []);
  
  const [activeTab, setActiveTab] = useState("overview");
  const [searchCustomer, setSearchCustomer] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  // Calculate Totals
  const totals = useMemo(() => {
    const totalPlots = plots.length;
    const available = plots.filter(p => p.status === "Available").length;
    const sold = totalPlots - available;
    const residential = plots.filter(p => p.category === "Residential").length;
    const commercial = plots.filter(p => p.category === "Commercial").length;
    const revenue = bookings.reduce((s,b)=> s + (Number(b.price || 0)), 0) + reacqs.reduce((s,r)=> s + (Number(r.price||0)), 0);
    const avgPrice = totalPlots > 0 ? revenue / sold : 0;
    return { totalPlots, available, sold, residential, commercial, revenue, avgPrice };
  }, [plots, bookings, reacqs]);

  // Customer List
  const customerList = useMemo(() => {
    return customers.map(c => ({
      id: c.id,
      name: c.fullName,
      cnic: c.cnic,
      phone: c.phone,
      email: c.email || "N/A",
      address: c.address || "N/A"
    })).filter(c =>
      c.name.toLowerCase().includes(searchCustomer.toLowerCase()) ||
      c.cnic.includes(searchCustomer)
    );
  }, [customers, searchCustomer]);

  // Plot Analysis by Category
  const categoryBreakdown = useMemo(() => {
    return {
      residential: plots.filter(p => p.category === "Residential"),
      commercial: plots.filter(p => p.category === "Commercial")
    };
  }, [plots]);

  // Monthly Sales
  const monthly = useMemo(() => {
    const sums = {};
    const push = (dateStr, amount) => {
      const d = dateStr ? new Date(dateStr) : new Date();
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
      sums[key] = (sums[key] || 0) + Number(amount || 0);
    };
    bookings.forEach(b => push(b.createdAt, b.price));
    reacqs.forEach(r => push(r.createdAt, r.price));
    return Object.fromEntries(Object.entries(sums).sort());
  }, [bookings, reacqs]);

  // Block-wise Analysis
  const blockAnalysis = useMemo(() => {
    const blocks = {};
    plots.forEach(p => {
      if (!blocks[p.block]) {
        blocks[p.block] = { total: 0, available: 0, sold: 0, revenue: 0 };
      }
      blocks[p.block].total++;
      if (p.status === "Available") blocks[p.block].available++;
      else blocks[p.block].sold++;
      blocks[p.block].revenue += Number(p.price || 0);
    });
    return Object.entries(blocks).map(([block, data]) => ({ block, ...data })).sort((a, b) => a.block.localeCompare(b.block));
  }, [plots]);

  // Export Functions
  const exportCustomersCSV = () => {
    const rows = ["Name,CNIC,Phone,Email,Address"];
    customerList.forEach(c => rows.push([`"${c.name}"`, c.cnic, c.phone, `"${c.email}"`, `"${c.address}"`].join(",")));
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `customers_${new Date().toISOString().split('T')[0]}.csv`; a.click();
    toast.success("Customers exported successfully!");
  };

  const exportPlotsCSV = () => {
    const filtered = filterCategory === "all" ? plots : plots.filter(p => p.category === filterCategory);
    const rows = ["Plot No,Block,Size,Price,Category,Status,Owner"];
    filtered.forEach(p => rows.push([p.plotNumber, p.block.toUpperCase(), p.size, p.price, p.category, p.status, `"${p.owner || 'N/A'}"`].join(",")));
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `plots_${new Date().toISOString().split('T')[0]}.csv`; a.click();
    toast.success("Plots exported successfully!");
  };

  const exportBlockAnalysisCSV = () => {
    const rows = ["Block,Total,Available,Sold,Revenue"];
    blockAnalysis.forEach(b => rows.push([b.block.toUpperCase(), b.total, b.available, b.sold, b.revenue].join(",")));
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `block_analysis_${new Date().toISOString().split('T')[0]}.csv`; a.click();
    toast.success("Block analysis exported successfully!");
  };

  return (
    <div className="p-6 space-y-6">
      <Toaster position="top-right" />
      
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">📊 Reports & Analytics</h1>
        <p className="text-gray-600">Track your real estate performance with detailed insights</p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-linear-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200 shadow-sm hover:shadow-md transition">
          <p className="text-sm text-gray-600 mb-2">📈 Total Plots</p>
          <p className="text-3xl font-bold text-blue-600">{totals.totalPlots}</p>
          <p className="text-xs text-gray-500 mt-2">{totals.residential} Residential + {totals.commercial} Commercial</p>
        </div>

        <div className="bg-linear-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200 shadow-sm hover:shadow-md transition">
          <p className="text-sm text-gray-600 mb-2">✅ Available</p>
          <p className="text-3xl font-bold text-green-600">{totals.available}</p>
          <p className="text-xs text-gray-500 mt-2">{totals.totalPlots > 0 ? Math.round((totals.available/totals.totalPlots)*100) : 0}% of total</p>
        </div>

        <div className="bg-linear-to-br from-red-50 to-red-100 rounded-xl p-6 border border-red-200 shadow-sm hover:shadow-md transition">
          <p className="text-sm text-gray-600 mb-2">🔴 Sold/Booked</p>
          <p className="text-3xl font-bold text-red-600">{totals.sold}</p>
          <p className="text-xs text-gray-500 mt-2">{totals.totalPlots > 0 ? Math.round((totals.sold/totals.totalPlots)*100) : 0}% of total</p>
        </div>

        <div className="bg-linear-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200 shadow-sm hover:shadow-md transition">
          <p className="text-sm text-gray-600 mb-2">💰 Total Revenue</p>
          <p className="text-2xl font-bold text-purple-600">PKR {(totals.revenue/10000000).toFixed(1)}Cr</p>
          <p className="text-xs text-gray-500 mt-2">Avg: PKR {(totals.avgPrice/1000000).toFixed(1)}M/plot</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="flex border-b border-gray-200 overflow-x-auto hide-scrollbar">
          {[
            { id: "overview", label: "📊 Overview", icon: "📊" },
            { id: "customers", label: "👥 Customers", icon: "👥" },
            { id: "plots", label: "🏗️ Plots Analysis", icon: "🏗️" },
            { id: "monthly", label: "📅 Monthly Sales", icon: "📅" },
            { id: "blocks", label: "🗺️ Block Analysis", icon: "🗺️" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 font-semibold whitespace-nowrap transition ${
                activeTab === tab.id
                  ? "border-b-2 border-indigo-600 text-indigo-600 bg-indigo-50"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category Breakdown */}
                <div className="bg-linear-to-br from-slate-50 to-slate-100 rounded-lg p-5 border border-slate-200">
                  <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                    <span className="text-xl">📑</span> Category Breakdown
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <span className="font-medium text-blue-700">Residential</span>
                      <span className="text-lg font-bold text-blue-600">{totals.residential}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <span className="font-medium text-amber-700">Commercial</span>
                      <span className="text-lg font-bold text-amber-600">{totals.commercial}</span>
                    </div>
                  </div>
                </div>

                {/* Status Summary */}
                <div className="bg-linear-to-br from-slate-50 to-slate-100 rounded-lg p-5 border border-slate-200">
                  <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                    <span className="text-xl">📊</span> Status Summary
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                      <span className="font-medium text-green-700">Available</span>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">{totals.available}</div>
                        <div className="text-xs text-gray-500">{totals.totalPlots > 0 ? Math.round((totals.available/totals.totalPlots)*100) : 0}%</div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200">
                      <span className="font-medium text-red-700">Sold</span>
                      <div className="text-right">
                        <div className="text-lg font-bold text-red-600">{totals.sold}</div>
                        <div className="text-xs text-gray-500">{totals.totalPlots > 0 ? Math.round((totals.sold/totals.totalPlots)*100) : 0}%</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Customers Tab */}
          {activeTab === "customers" && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-3 justify-between">
                <input
                  type="text"
                  placeholder="Search by name or CNIC..."
                  value={searchCustomer}
                  onChange={(e) => setSearchCustomer(e.target.value)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                />
                <button
                  onClick={exportCustomersCSV}
                  className="flex items-center gap-2 bg-linear-to-r from-indigo-600 to-blue-600 text-white px-4 py-2.5 rounded-lg hover:from-indigo-700 hover:to-blue-700 font-semibold shadow-lg hover:shadow-xl transition"
                >
                  <MdDownload size={18} /> Export CSV
                </button>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto hide-scrollbar">
                  <table className="w-full text-sm">
                    <thead className="bg-linear-to-r from-slate-50 to-slate-100 border-b border-gray-200">
                      <tr>
                        <th className="py-4 px-6 text-left font-semibold text-gray-700">Name</th>
                        <th className="px-6 text-left font-semibold text-gray-700">CNIC</th>
                        <th className="px-6 text-left font-semibold text-gray-700">Phone</th>
                        <th className="px-6 text-left font-semibold text-gray-700">Email</th>
                        <th className="px-6 text-left font-semibold text-gray-700">Address</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {customerList.length === 0 ? (
                        <tr><td colSpan="5" className="p-8 text-center text-gray-500">📭 No customers found</td></tr>
                      ) : (
                        customerList.map(c => (
                          <tr key={c.id} className="hover:bg-gray-50 transition">
                            <td className="py-4 px-6 font-medium text-slate-800">{c.name}</td>
                            <td className="px-6 text-gray-600">{c.cnic}</td>
                            <td className="px-6 text-gray-600">{c.phone}</td>
                            <td className="px-6 text-gray-600 text-xs">{c.email}</td>
                            <td className="px-6 text-gray-600 text-xs">{c.address}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Plots Analysis Tab */}
          {activeTab === "plots" && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-3 justify-between">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                >
                  <option value="all">All Categories</option>
                  <option value="Residential">Residential</option>
                  <option value="Commercial">Commercial</option>
                </select>
                <button
                  onClick={exportPlotsCSV}
                  className="flex items-center gap-2 bg-linear-to-r from-indigo-600 to-blue-600 text-white px-4 py-2.5 rounded-lg hover:from-indigo-700 hover:to-blue-700 font-semibold shadow-lg hover:shadow-xl transition"
                >
                  <MdDownload size={18} /> Export CSV
                </button>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto hide-scrollbar">
                  <table className="w-full text-sm">
                    <thead className="bg-linear-to-r from-slate-50 to-slate-100 border-b border-gray-200">
                      <tr>
                        <th className="py-4 px-6 text-left font-semibold text-gray-700">Plot No</th>
                        <th className="px-6 text-left font-semibold text-gray-700">Block</th>
                        <th className="px-6 text-left font-semibold text-gray-700">Size</th>
                        <th className="px-6 text-left font-semibold text-gray-700">Price (PKR)</th>
                        <th className="px-6 text-left font-semibold text-gray-700">Category</th>
                        <th className="px-6 text-left font-semibold text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {(filterCategory === "all" ? plots : plots.filter(p => p.category === filterCategory)).length === 0 ? (
                        <tr><td colSpan="6" className="p-8 text-center text-gray-500">📭 No plots found</td></tr>
                      ) : (
                        (filterCategory === "all" ? plots : plots.filter(p => p.category === filterCategory)).map((p, idx) => (
                          <tr key={idx} className="hover:bg-gray-50 transition">
                            <td className="py-4 px-6 font-semibold text-indigo-600">{p.plotNumber}</td>
                            <td className="px-6 font-medium">{p.block.toUpperCase()}</td>
                            <td className="px-6 text-gray-600">{p.size}</td>
                            <td className="px-6 font-semibold text-gray-800">PKR {Number(p.price).toLocaleString()}</td>
                            <td className="px-6">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${p.category === "Residential" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>
                                {p.category}
                              </span>
                            </td>
                            <td className="px-6">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${p.status === "Available" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                {p.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Monthly Sales Tab */}
          {activeTab === "monthly" && (
            <div className="space-y-4">
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto hide-scrollbar">
                  <table className="w-full text-sm">
                    <thead className="bg-linear-to-r from-slate-50 to-slate-100 border-b border-gray-200">
                      <tr>
                        <th className="py-4 px-6 text-left font-semibold text-gray-700">📅 Month</th>
                        <th className="px-6 text-left font-semibold text-gray-700">💰 Amount (PKR)</th>
                        <th className="px-6 text-left font-semibold text-gray-700">📈 Change</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {Object.keys(monthly).length === 0 ? (
                        <tr><td colSpan="3" className="p-8 text-center text-gray-500">📭 No monthly data</td></tr>
                      ) : (
                        Object.entries(monthly).map(([k, v], idx, arr) => {
                          const prev = idx > 0 ? arr[idx-1][1] : v;
                          const change = idx > 0 ? ((v - prev) / prev * 100).toFixed(1) : 0;
                          return (
                            <tr key={k} className="hover:bg-gray-50 transition">
                              <td className="py-4 px-6 font-semibold text-slate-800">{k}</td>
                              <td className="px-6 font-bold text-indigo-600">PKR {Number(v).toLocaleString()}</td>
                              <td className="px-6">
                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${change >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                  {change >= 0 ? "📈" : "📉"} {change}%
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Block Analysis Tab */}
          {activeTab === "blocks" && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={exportBlockAnalysisCSV}
                  className="flex items-center gap-2 bg-linear-to-r from-indigo-600 to-blue-600 text-white px-4 py-2.5 rounded-lg hover:from-indigo-700 hover:to-blue-700 font-semibold shadow-lg hover:shadow-xl transition"
                >
                  <MdDownload size={18} /> Export CSV
                </button>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto hide-scrollbar">
                  <table className="w-full text-sm">
                    <thead className="bg-linear-to-r from-slate-50 to-slate-100 border-b border-gray-200">
                      <tr>
                        <th className="py-4 px-6 text-left font-semibold text-gray-700">🗺️ Block</th>
                        <th className="px-6 text-left font-semibold text-gray-700">📊 Total</th>
                        <th className="px-6 text-left font-semibold text-gray-700">✅ Available</th>
                        <th className="px-6 text-left font-semibold text-gray-700">🔴 Sold</th>
                        <th className="px-6 text-left font-semibold text-gray-700">💰 Revenue (PKR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {blockAnalysis.length === 0 ? (
                        <tr><td colSpan="5" className="p-8 text-center text-gray-500">📭 No block data</td></tr>
                      ) : (
                        blockAnalysis.map((b, idx) => (
                          <tr key={idx} className="hover:bg-gray-50 transition">
                            <td className="py-4 px-6 font-bold text-indigo-600 text-lg">{b.block.toUpperCase()}</td>
                            <td className="px-6 font-semibold text-slate-800">{b.total}</td>
                            <td className="px-6">
                              <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">{b.available}</span>
                            </td>
                            <td className="px-6">
                              <span className="inline-block px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">{b.sold}</span>
                            </td>
                            <td className="px-6 font-bold text-purple-600">PKR {Number(b.revenue).toLocaleString()}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
