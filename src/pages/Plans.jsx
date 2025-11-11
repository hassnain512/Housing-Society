import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import toast, { Toaster } from "react-hot-toast";

const Plans = () => {
  const customers = useSelector((state) => state.customers.list ?? []);
  const plots = useSelector((state) => state.plots.plots ?? []);

  const [cnic, setCnic] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [plotNumber, setPlotNumber] = useState("");
  const [plotSize, setPlotSize] = useState("");
  const [plotPrice, setPlotPrice] = useState("");
  const [downPayment, setDownPayment] = useState("");
  const [durationType, setDurationType] = useState("months");
  const [durationValue, setDurationValue] = useState("");
  const [fullPayment, setFullPayment] = useState(false);

  // Auto-fetch customer & plot info
  useEffect(() => {
    const customer = customers.find(
      (c) => c.cnic.replace(/-/g, "") === cnic.replace(/-/g, "")
    );
    if (customer) {
      setCustomerName(customer.fullName);
      setCustomerPhone(customer.phone || "");
      const availablePlot = plots.find((p) => p.status === "Available");
      if (availablePlot) {
        setPlotNumber(availablePlot.plotNumber);
        setPlotSize(availablePlot.size);
        setPlotPrice(availablePlot.price);
      }
    } else {
      setCustomerName("");
      setCustomerPhone("");
      setPlotNumber("");
      setPlotSize("");
      setPlotPrice("");
    }
  }, [cnic, customers, plots]);

  const handleGeneratePlan = () => {
    const price = Number(plotPrice);
    const down = Number(downPayment);

    if (!cnic || cnic.replace(/-/g, "").length !== 13) {
      toast.error("Please enter a valid 13-digit CNIC.");
      return;
    }

    if (!customerName) {
      toast.error("Customer not found.");
      return;
    }

    if (!price) {
      toast.error("Plot price not found.");
      return;
    }

    let remaining = price;
    let totalUnits = 1;
    let perInstallment = price;

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
        plotPrice: price,
        downPayment: fullPayment ? price : down,
        remaining,
        durationType,
        durationValue: fullPayment ? 1 : durationValue,
        installments: generatedInstallments,
        fullPayment,
      })
    );

    toast.success("✅ Plan Created! Visit Installments Page to View Table.");
  };

  return (
    <div className="p-4 sm:p-6">
      <Toaster position="top-right" />
      <h2 className="text-2xl font-semibold text-slate-800 mb-6">
        Create Installment Plan
      </h2>

      {/* CNIC Input */}
      <div className="mb-4 w-full sm:w-1/2">
        <input
          type="text"
          placeholder="Enter Customer CNIC"
          className="border px-3 py-2 rounded-md w-full"
          value={cnic}
          onChange={(e) => setCnic(e.target.value)}
        />
      </div>

      {/* Auto-fetched info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <input
          type="text"
          placeholder="Customer Name"
          className="border px-3 py-2 rounded-md bg-gray-100"
          value={customerName}
          readOnly
        />
        <input
          type="text"
          placeholder="Phone"
          className="border px-3 py-2 rounded-md bg-gray-100"
          value={customerPhone}
          readOnly
        />
        <input
          type="text"
          placeholder="Plot Number"
          className="border px-3 py-2 rounded-md bg-gray-100"
          value={plotNumber}
          readOnly
        />
        <input
          type="text"
          placeholder="Plot Size"
          className="border px-3 py-2 rounded-md bg-gray-100"
          value={plotSize}
          readOnly
        />
        <input
          type="number"
          placeholder="Plot Price (PKR)"
          className="border px-3 py-2 rounded-md bg-gray-100"
          value={plotPrice}
          readOnly
        />
        {!fullPayment && (
          <input
            type="number"
            placeholder="Down Payment (PKR)"
            className="border px-3 py-2 rounded-md"
            value={downPayment}
            onChange={(e) => setDownPayment(e.target.value)}
          />
        )}
      </div>

      {/* Full Payment Option */}
      <div className="flex items-center gap-3 mb-6">
        <input
          type="checkbox"
          id="fullPayment"
          checked={fullPayment}
          onChange={(e) => setFullPayment(e.target.checked)}
        />
        <label htmlFor="fullPayment" className="text-sm text-gray-700">
          Full Payment (One-time)
        </label>
      </div>

      {/* Duration Input */}
      {!fullPayment && (
        <div className="flex gap-3 flex-wrap mb-6">
          <input
            type="number"
            placeholder="Enter Duration"
            className="border px-3 py-2 rounded-md w-40"
            value={durationValue}
            onChange={(e) => setDurationValue(e.target.value)}
          />
          <select
            value={durationType}
            onChange={(e) => setDurationType(e.target.value)}
            className="border px-4 py-2 rounded-md"
          >
            <option value="days">Days</option>
            <option value="months">Months</option>
            <option value="years">Years</option>
          </select>
        </div>
      )}

      <button
        onClick={handleGeneratePlan}
        className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
      >
        Generate Plan
      </button>
    </div>
  );
};

export default Plans;
