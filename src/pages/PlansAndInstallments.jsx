import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import toast, { Toaster } from "react-hot-toast";

const PlansAndInstallments = () => {
  const customers = useSelector((state) => state.customers.list ?? []);
  const plots = useSelector((state) => state.plots.plots ?? []);

  // Tab state
  const [activeTab, setActiveTab] = useState("plans"); // "plans" or "installments"

  // Plans form state
  const [cnic, setCnic] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [selectedPlotId, setSelectedPlotId] = useState("");
  const [plotNumber, setPlotNumber] = useState("");
  const [plotSize, setPlotSize] = useState("");
  const [plotBlock, setPlotBlock] = useState("");
  const [plotPrice, setPlotPrice] = useState("");
  const [downPayment, setDownPayment] = useState("");
  const [developmentCharges, setDevelopmentCharges] = useState("");
  const [durationType, setDurationType] = useState("months");
  const [durationValue, setDurationValue] = useState("");
  const [fullPayment, setFullPayment] = useState(false);

  // Installments state
  const [plan, setPlan] = useState(null);
  const [installmentsCnic, setInstallmentsCnic] = useState("");

  // Get available plots
  const availablePlots = plots.filter((p) => p.status === "Available");

  // Auto-fetch customer info for Plans
  useEffect(() => {
    const customer = customers.find(
      (c) => c.cnic.replace(/-/g, "") === cnic.replace(/-/g, "")
    );
    if (customer) {
      setCustomerName(customer.fullName);
      setCustomerPhone(customer.phone || "");
    } else {
      setCustomerName("");
      setCustomerPhone("");
    }
  }, [cnic, customers]);

  // Auto-fetch plot info when plot is selected
  useEffect(() => {
    const selectedPlot = plots.find((p) => p.id === Number(selectedPlotId));
    if (selectedPlot) {
      setPlotNumber(selectedPlot.plotNumber);
      setPlotSize(selectedPlot.size);
      setPlotBlock(selectedPlot.block);
      setPlotPrice(selectedPlot.price);
    } else {
      setPlotNumber("");
      setPlotSize("");
      setPlotBlock("");
      setPlotPrice("");
    }
  }, [selectedPlotId, plots]);

  // Load plan from localStorage for Installments
  useEffect(() => {
    const savedPlan = JSON.parse(localStorage.getItem("latestPlan"));
    if (savedPlan) {
      setPlan(savedPlan);
      setInstallmentsCnic(savedPlan.cnic);
    }
  }, [activeTab]);

  // Auto fetch plan by CNIC for Installments
  useEffect(() => {
    if (!installmentsCnic) {
      const savedPlan = JSON.parse(localStorage.getItem("latestPlan"));
      if (savedPlan) {
        setPlan(savedPlan);
      }
      return;
    }
    const savedPlan = JSON.parse(localStorage.getItem("latestPlan"));
    if (
      savedPlan &&
      savedPlan.cnic.replace(/-/g, "") === installmentsCnic.replace(/-/g, "")
    ) {
      setPlan(savedPlan);
    } else {
      setPlan(null);
    }
  }, [installmentsCnic]);

  // Plans Tab - Generate Plan
  const handleGeneratePlan = () => {
    const price = Number(plotPrice);
    const down = Number(downPayment);
    const devCharges = Number(developmentCharges) || 0;

    if (!cnic || cnic.replace(/-/g, "").length !== 13) {
      toast.error("Please enter a valid 13-digit CNIC.");
      return;
    }

    if (!customerName) {
      toast.error("Customer not found.");
      return;
    }

    if (!selectedPlotId || !plotNumber) {
      toast.error("Please select a plot.");
      return;
    }

    if (!price) {
      toast.error("Plot price not found.");
      return;
    }

    let remaining = price;
    let totalUnits = 1;
    let perInstallment = price;
    let perDevCharge = 0;

    if (!fullPayment) {
      if (!down || down >= price || !durationValue) {
        toast.error("Please fill all fields correctly.");
        return;
      }

      totalUnits =
        durationType === "years"
          ? durationValue * 12
          : durationType === "months"
          ? durationValue
          : durationType === "days"
          ? durationValue
          : 0;

      remaining = price - down;
      perInstallment = Math.round(remaining / totalUnits);
      perDevCharge = Math.round(devCharges / totalUnits);
    } else {
      perDevCharge = devCharges;
    }

    const generatedInstallments = Array.from(
      { length: totalUnits },
      (_, i) => ({
        id: i + 1,
        period: fullPayment
          ? "Full Payment"
          : durationType === "days"
          ? `Day ${i + 1}`
          : `Month ${i + 1}`,
        amount: fullPayment ? price : perInstallment,
        developmentCharge: perDevCharge,
        total: (fullPayment ? price : perInstallment) + perDevCharge,
        status: "Pending",
        dueDate: new Date(
          new Date().setMonth(new Date().getMonth() + i)
        ).toLocaleDateString(),
      })
    );

    localStorage.setItem(
      "latestPlan",
      JSON.stringify({
        customerName,
        customerPhone,
        cnic,
        plotNumber,
        plotSize,
        plotBlock,
        plotPrice: price,
        downPayment: fullPayment ? price : down,
        developmentCharges: devCharges,
        remaining,
        durationType,
        durationValue: fullPayment ? 1 : durationValue,
        installments: generatedInstallments,
        fullPayment,
      })
    );

    toast.success(
      "✅ Plan Created! Switch to Installments Tab to View Details."
    );

    // Auto-switch to installments tab
    setActiveTab("installments");
  };

  // Installments Tab - Mark single installment as paid
  const handlePayment = (id) => {
    if (!plan) return;
    const updatedInstallments = plan.installments.map((item) =>
      item.id === id ? { ...item, status: "Paid" } : item
    );
    const updatedPlan = { ...plan, installments: updatedInstallments };
    setPlan(updatedPlan);
    localStorage.setItem("latestPlan", JSON.stringify(updatedPlan));
    toast.success(`Installment #${id} paid successfully!`);
  };

  // Installments Tab - Full payment
  const handleFullPayment = () => {
    if (!plan) return;
    const updatedInstallments = plan.installments.map((item) => ({
      ...item,
      status: "Paid",
    }));
    const updatedPlan = {
      ...plan,
      installments: updatedInstallments,
      fullPayment: true,
    };
    setPlan(updatedPlan);
    localStorage.setItem("latestPlan", JSON.stringify(updatedPlan));
    toast.success("Full payment completed!");
  };

  return (
    <div className="p-4 sm:p-6">
      <Toaster position="top-right" />

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          Payment Plans & Installments
        </h1>
        <p className="text-gray-600">
          Create flexible payment plans with development charges and manage
          installment schedules
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-4 mb-8 border-b-2 border-gray-200">
        <button
          onClick={() => setActiveTab("plans")}
          className={`px-6 py-3 font-semibold text-sm transition-all ${
            activeTab === "plans"
              ? "text-indigo-600 border-b-4 border-indigo-600 -mb-2"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          ➕ Create Plan
        </button>
        <button
          onClick={() => setActiveTab("installments")}
          className={`px-6 py-3 font-semibold text-sm transition-all ${
            activeTab === "installments"
              ? "text-indigo-600 border-b-4 border-indigo-600 -mb-2"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          📅 Installment Schedule
        </button>
      </div>

      {/* Plans Tab */}
      {activeTab === "plans" && (
        <div className="space-y-6">
          {/* Customer Selection Section */}
          <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-blue-600 rounded-full"></span>Customer
              Details
            </h3>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                CNIC *
              </label>
              <input
                type="text"
                placeholder="00000-0000000-0"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition font-mono"
                value={cnic}
                onChange={(e) => setCnic(e.target.value)}
              />
            </div>

            {customerName && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded-lg border border-blue-100">
                  <p className="text-xs text-gray-600 mb-1">Customer Name</p>
                  <p className="text-sm font-semibold text-slate-800">
                    {customerName}
                  </p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-blue-100">
                  <p className="text-xs text-gray-600 mb-1">Phone Number</p>
                  <p className="text-sm font-semibold text-slate-800 font-mono">
                    {customerPhone || "—"}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Plot Selection Section */}
          <div className="bg-linear-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-green-600 rounded-full"></span>Plot
              Selection
            </h3>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Plot *
              </label>
              <select
                value={selectedPlotId}
                onChange={(e) => setSelectedPlotId(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition"
                disabled={!customerName}
              >
                <option value="">-- Select an Available Plot --</option>
                {availablePlots.map((plot) => (
                  <option key={plot.id} value={plot.id}>
                    Plot {plot.plotNumber} • Block {plot.block} • {plot.size} •
                    PKR {Number(plot.price).toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            {plotNumber && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded-lg border border-green-100">
                  <p className="text-xs text-gray-600 mb-1">Plot Number</p>
                  <p className="text-sm font-semibold text-slate-800">
                    {plotNumber}
                  </p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-green-100">
                  <p className="text-xs text-gray-600 mb-1">Block</p>
                  <p className="text-sm font-semibold text-slate-800">
                    {plotBlock}
                  </p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-green-100">
                  <p className="text-xs text-gray-600 mb-1">Size</p>
                  <p className="text-sm font-semibold text-slate-800">
                    {plotSize}
                  </p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-green-100">
                  <p className="text-xs text-gray-600 mb-1">Price</p>
                  <p className="text-sm font-semibold text-emerald-600">
                    PKR {Number(plotPrice).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Payment Details Section */}
          <div className="bg-linear-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-purple-600 rounded-full"></span>
              Payment Details
            </h3>

            {/* Full Payment Toggle */}
            <div className="flex items-center gap-3 mb-6 p-3 bg-white rounded-lg border border-purple-100">
              <input
                type="checkbox"
                id="fullPayment"
                checked={fullPayment}
                onChange={(e) => setFullPayment(e.target.checked)}
                className="w-5 h-5 accent-purple-600"
              />
              <label
                htmlFor="fullPayment"
                className="text-sm font-semibold text-gray-700 cursor-pointer"
              >
                💰 Full Payment (One-time)
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Down Payment *
                </label>
                <input
                  type="number"
                  placeholder="Enter down payment"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
                  value={downPayment}
                  onChange={(e) => setDownPayment(e.target.value)}
                  disabled={fullPayment}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Development Charges
                </label>
                <input
                  type="number"
                  placeholder="Enter development charges"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
                  value={developmentCharges}
                  onChange={(e) => setDevelopmentCharges(e.target.value)}
                />
              </div>
            </div>

            {!fullPayment && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Duration Value *
                  </label>
                  <input
                    type="number"
                    placeholder="Enter duration"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
                    value={durationValue}
                    onChange={(e) => setDurationValue(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Duration Type *
                  </label>
                  <select
                    value={durationType}
                    onChange={(e) => setDurationType(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
                  >
                    <option value="days">Days</option>
                    <option value="months">Months</option>
                    <option value="years">Years</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              onClick={handleGeneratePlan}
              disabled={!customerName || !plotNumber}
              className="bg-linear-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
            >
              ✨ Generate Plan
            </button>
          </div>
        </div>
      )}

      {/* Installments Tab */}
      {activeTab === "installments" && (
        <div>
          <h2 className="text-2xl font-semibold text-slate-800 mb-4">
            Installment Schedule
          </h2>

          {/* CNIC Search */}
          <div className="mb-6 flex gap-3 items-end w-full sm:w-1/2">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search by CNIC
              </label>
              <input
                type="text"
                placeholder="Enter Customer CNIC to search"
                className="border px-3 py-2 rounded-md w-full"
                value={installmentsCnic}
                onChange={(e) => setInstallmentsCnic(e.target.value)}
              />
            </div>
            <button
              onClick={() => {
                const savedPlan = JSON.parse(
                  localStorage.getItem("latestPlan")
                );
                if (savedPlan) {
                  setPlan(savedPlan);
                  setInstallmentsCnic(savedPlan.cnic);
                  toast.success("Plan loaded");
                } else {
                  toast.error("No plan found in storage");
                }
              }}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 font-medium"
            >
              Load Latest Plan
            </button>
          </div>

          {!plan ? (
            <div className="text-center py-10 text-gray-500 border rounded-lg bg-white">
              No Plan Found. Please create a plan first.
            </div>
          ) : (
            <>
              {/* Summary */}
              <div className="mb-6 p-4 rounded-lg bg-indigo-50 border border-indigo-100 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <p>
                  <b>Customer:</b> {plan.customerName}
                </p>
                <p>
                  <b>Phone:</b> {plan.customerPhone || "—"}
                </p>
                <p>
                  <b>Plot Number:</b> {plan.plotNumber}
                </p>
                <p>
                  <b>Plot Size:</b> {plan.plotSize}
                </p>
                <p>
                  <b>Plot Price:</b> PKR {plan.plotPrice.toLocaleString()}
                </p>
                <p>
                  <b>Down Payment:</b> PKR {plan.downPayment.toLocaleString()}
                </p>
                <p>
                  <b>Development Charges:</b> PKR{" "}
                  {plan.developmentCharges?.toLocaleString() || "0"}
                </p>
                <p>
                  <b>Remaining Amount:</b> PKR {plan.remaining.toLocaleString()}
                </p>
                <p>
                  <b>Duration:</b>{" "}
                  {plan.fullPayment
                    ? "Full Payment"
                    : `${plan.durationValue} ${plan.durationType}`}
                </p>
              </div>

              {/* Full Payment Button */}
              {!plan.fullPayment && (
                <div className="mb-4">
                  <button
                    onClick={handleFullPayment}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                  >
                    Pay Full Remaining Amount
                  </button>
                </div>
              )}

              {/* Table */}
              <div className="overflow-x-auto bg-white border rounded-xl shadow-sm">
                <table className="min-w-full divide-y">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left">#</th>
                      <th className="px-4 py-3 text-left">Period</th>
                      <th className="px-4 py-3 text-left">Due Date</th>
                      <th className="px-4 py-3 text-left">
                        Monthly Installment
                      </th>
                      <th className="px-4 py-3 text-left">
                        Development Charges
                      </th>
                      <th className="px-4 py-3 text-left">Total</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {plan.installments.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">{item.id}</td>
                        <td className="px-4 py-3">{item.period}</td>
                        <td className="px-4 py-3">{item.dueDate}</td>
                        <td className="px-4 py-3 text-indigo-600 font-medium">
                          PKR {item.amount.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-green-600 font-medium">
                          PKR {(item.developmentCharge || 0).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-blue-600 font-bold">
                          PKR {(item.total || item.amount).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-3 py-1 text-xs rounded-full ${
                              item.status === "Pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {item.status === "Pending" && (
                            <button
                              onClick={() => handlePayment(item.id)}
                              className="bg-blue-600 text-white px-2 py-1 rounded-md hover:bg-blue-700 text-sm"
                            >
                              Mark Paid
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PlansAndInstallments;
