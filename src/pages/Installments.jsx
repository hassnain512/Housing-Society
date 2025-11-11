import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import toast, { Toaster } from "react-hot-toast";

const Installments = () => {
  const customers = useSelector((state) => state.customers.list ?? []);
  const plots = useSelector((state) => state.plots.plots ?? []);
  const [cnic, setCnic] = useState("");
  const [plan, setPlan] = useState(null);

  // Load plan from localStorage
  useEffect(() => {
    const savedPlan = JSON.parse(localStorage.getItem("latestPlan"));
    if (savedPlan) {
      setPlan(savedPlan);
      setCnic(savedPlan.cnic);
    }
  }, []);

  // Auto fetch plan by CNIC
  useEffect(() => {
    if (!cnic) return;
    const savedPlan = JSON.parse(localStorage.getItem("latestPlan"));
    if (
      savedPlan &&
      savedPlan.cnic.replace(/-/g, "") === cnic.replace(/-/g, "")
    ) {
      setPlan(savedPlan);
    } else {
      setPlan(null);
    }
  }, [cnic]);

  if (!plan) {
    return (
      <div className="p-6">
        <Toaster position="top-right" />
        <div className="text-center py-10 text-gray-500 border rounded-lg bg-white">
          No Plan Found. Please create a plan first.
        </div>
      </div>
    );
  }

  // Mark single installment as paid
  const handlePayment = (id) => {
    const updatedInstallments = plan.installments.map((item) =>
      item.id === id ? { ...item, status: "Paid" } : item
    );
    const updatedPlan = { ...plan, installments: updatedInstallments };
    setPlan(updatedPlan);
    localStorage.setItem("latestPlan", JSON.stringify(updatedPlan));
    toast.success(`Installment #${id} paid successfully!`);
  };

  // Full payment
  const handleFullPayment = () => {
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
      <h2 className="text-2xl font-semibold text-slate-800 mb-4">
        Installment Schedule
      </h2>

      {/* CNIC Search */}
      <div className="mb-6 w-full sm:w-1/2">
        <input
          type="text"
          placeholder="Enter Customer CNIC to search"
          className="border px-3 py-2 rounded-md w-full"
          value={cnic}
          onChange={(e) => setCnic(e.target.value)}
        />
      </div>

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
              <th className="px-4 py-3 text-left">Amount</th>
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
                <td className="px-4 py-3 text-indigo-600">
                  PKR {item.amount.toLocaleString()}
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
    </div>
  );
};

export default Installments;
