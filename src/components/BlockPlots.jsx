import React from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";

export default function BlockPlots() {
  const { block } = useParams();
  const plots = useSelector((state) => state.plots.plots ?? []);

  const filteredPlots = plots.filter((p) => p.block.toUpperCase() === block.toUpperCase());

  const formatPrice = (price) => Number(price).toLocaleString("en-PK");

  return (
    <div className="p-5">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Block {block} Plots</h2>
        <Link to="/plots" className="text-blue-600 hover:underline">Back to All Plots</Link>
      </div>

      <div className="overflow-x-auto bg-white shadow-md rounded-lg p-4 border border-gray-200">
        <table className="w-full text-sm md:text-base">
          <thead>
            <tr className="text-left text-slate-600 border-b border-slate-200">
              <th className="py-3 px-2">Plot No</th>
              <th className="px-2">Size</th>
              <th className="px-2">Price (PKR)</th>
              <th className="px-2">Category</th>
              <th className="px-2">Status</th>
              <th className="px-2">Owner</th>
            </tr>
          </thead>
          <tbody>
            {filteredPlots.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-5 text-gray-500">
                  No plots found in this block
                </td>
              </tr>
            ) : (
              filteredPlots.map((p, index) => (
                <tr key={index} className="border-b last:border-none hover:bg-gray-50 transition">
                  <td className="py-3 px-2">{p.plotNumber}</td>
                  <td className="px-2">{p.size}</td>
                  <td className="px-2">{formatPrice(p.price)}</td>
                  <td className="px-2">{p.category}</td>
                  <td className="px-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        p.status === "Available"
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-2">{p.owner || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
