import React from "react";
import Card from "../components/Card.jsx";
import {
  MdPeople,
  MdOutlineLandscape,
  MdPayment,
  MdShoppingBag,
} from "react-icons/md";
function Dashboard() {
  return (
    <div>
      <h2 className="text-xl font-semibold">Dashboard</h2>

      {/* Cards row: each Card is 100% on small screens and 20% on md+, with equal gaps and wrapping */}
      <div className="mt-4 flex flex-wrap gap-4 items-start">
        <Card
          title="Total Customers"
          value={250}
          bgColor="bg-blue-50"
          titleColor="text-blue-700"
          iconBg="bg-blue-200"
          icon={<MdPeople size={22} className="text-blue-700" />}
        />

        <Card
          title="Total Plots"
          value={1200}
          bgColor="bg-green-50"
          titleColor="text-green-700"
          iconBg="bg-green-200"
          icon={<MdOutlineLandscape size={22} className="text-green-700" />}
        />

        <Card
          title="Total Collection"
          value="PKR 120M"
          bgColor="bg-yellow-50"
          titleColor="text-yellow-700"
          iconBg="bg-yellow-200"
          icon={<MdPayment size={22} className="text-yellow-700" />}
        />

        <Card
          title="Defaulters"
          value={18}
          bgColor="bg-red-50"
          titleColor="text-red-700"
          iconBg="bg-red-200"
          icon={<MdShoppingBag size={22} className="text-red-700" />}
        />
      </div>
    </div>
  );
}

export default Dashboard;
