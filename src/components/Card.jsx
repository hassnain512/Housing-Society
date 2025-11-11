import React from "react";

/**
 * Card Component
 * Props:
 *  - title (string)
 *  - value (string | number)
 *  - bgColor (string)      // e.g. "bg-white" or "bg-blue-50"
 *  - titleColor (string)   // e.g. "text-gray-500"
 *  - iconBg (string)       // e.g. "bg-blue-100"
 *  - icon (ReactNode)
 */

export default function Card({
  title ,
  value ,
  bgColor,
  titleColor,
  iconBg ,
  icon,
}) {
  return (
    <div className={`${bgColor} rounded-xl shadow-sm border border-gray-100 p-5 w-full md:w-[20%] shrink-0`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm ${titleColor}`}>{title}</p>
          <div className="mt-2 text-2xl font-bold text-slate-800">{value}</div>
        </div>

        <div className={`p-3 rounded-lg ${iconBg} text-slate-800`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
