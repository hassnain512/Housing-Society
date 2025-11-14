import React, { useState } from 'react';
import  plotsData from "../data/PlotsData.jsx";
import mapSvg from '../assets/map.svg';

function MapView() {
  const [selectedPlot, setSelectedPlot] = useState(null);
  const [hoveredPlot, setHoveredPlot] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return '#22c55e';
      case 'sold':
        return '#ef4444';
      case 'reserved':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'sold':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'reserved':
        return 'bg-amber-100 text-amber-700 border-amber-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const visiblePlots = filterStatus === 'all' 
    ? plotsData 
    : plotsData.filter(p => p.status === filterStatus);

  const stats = {
    total: plotsData.length,
    available: plotsData.filter(p => p.status === 'available').length,
    reserved: plotsData.filter(p => p.status === 'reserved').length,
    sold: plotsData.filter(p => p.status === 'sold').length,
  };

  return (
    <div className="p-6 bg-linear-to-br from-slate-50 to-slate-100 min-h-screen">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Maps View</h1>
        <p className="text-gray-600">Interactive map to visualize and manage property plots</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm hover:shadow-md transition">
          <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Total Plots</p>
          <p className="text-3xl font-bold text-slate-800">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg p-5 border border-green-200 shadow-sm hover:shadow-md transition">
          <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Available</p>
          <p className="text-3xl font-bold text-green-600">{stats.available}</p>
        </div>
        <div className="bg-white rounded-lg p-5 border border-amber-200 shadow-sm hover:shadow-md transition">
          <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Reserved</p>
          <p className="text-3xl font-bold text-amber-600">{stats.reserved}</p>
        </div>
        <div className="bg-white rounded-lg p-5 border border-red-200 shadow-sm hover:shadow-md transition">
          <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Sold</p>
          <p className="text-3xl font-bold text-red-600">{stats.sold}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Section */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Map Toolbar */}
          <div className="bg-linear-to-r from-slate-50 to-slate-100 border-b border-gray-200 p-4">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Property Layout</h2>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                    filterStatus === 'all'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  All ({stats.total})
                </button>
                <button
                  onClick={() => setFilterStatus('available')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                    filterStatus === 'available'
                      ? 'bg-green-600 text-white shadow-md'
                      : 'bg-white border border-green-300 text-green-700 hover:bg-green-50'
                  }`}
                >
                  Available ({stats.available})
                </button>
                <button
                  onClick={() => setFilterStatus('reserved')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                    filterStatus === 'reserved'
                      ? 'bg-amber-600 text-white shadow-md'
                      : 'bg-white border border-amber-300 text-amber-700 hover:bg-amber-50'
                  }`}
                >
                  Reserved ({stats.reserved})
                </button>
                <button
                  onClick={() => setFilterStatus('sold')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                    filterStatus === 'sold'
                      ? 'bg-red-600 text-white shadow-md'
                      : 'bg-white border border-red-300 text-red-700 hover:bg-red-50'
                  }`}
                >
                  Sold ({stats.sold})
                </button>
              </div>
            </div>
          </div>

          {/* Map Container */}
          <div className="p-6">
            <div className="relative w-full bg-gray-50 rounded-lg overflow-auto border border-gray-200">
              <svg
                viewBox="0 0 567 546"
                className="w-full h-auto"
                style={{ minHeight: '500px' }}
              >
                {/* Background Image */}
                <image href={mapSvg} width="567" height="546" opacity="0.2" />

                {/* Interactive Plots */}
                {visiblePlots.map((plot) => (
                  <g key={plot.id}>
                    <rect
                      x={plot.x + 28.75}
                      y={plot.y + 20.13}
                      width={plot.width}
                      height={plot.height}
                      fill={
                        selectedPlot?.id === plot.id
                          ? '#3b82f6'
                          : hoveredPlot?.id === plot.id
                          ? getStatusColor(plot.status)
                          : getStatusColor(plot.status)
                      }
                      opacity={
                        selectedPlot?.id === plot.id ? 0.85 : hoveredPlot?.id === plot.id ? 0.75 : 0.6
                      }
                      stroke={
                        selectedPlot?.id === plot.id
                          ? '#1d4ed8'
                          : hoveredPlot?.id === plot.id
                          ? '#ffffff'
                          : '#d1d5db'
                      }
                      strokeWidth={selectedPlot?.id === plot.id ? 3 : hoveredPlot?.id === plot.id ? 2 : 1.5}
                      style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                      onMouseEnter={() => setHoveredPlot(plot)}
                      onMouseLeave={() => setHoveredPlot(null)}
                      onClick={() => setSelectedPlot(plot)}
                    />
                    {/* Plot Label */}
                    {(hoveredPlot?.id === plot.id || selectedPlot?.id === plot.id) && (
                      <text
                        x={plot.x + 28.75 + plot.width / 2}
                        y={plot.y + 20.13 + plot.height / 2}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="#ffffff"
                        fontSize="11"
                        fontWeight="bold"
                        pointerEvents="none"
                        style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}
                      >
                        {plot.name}
                      </text>
                    )}
                  </g>
                ))}
              </svg>
            </div>

            {/* Legend */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="w-5 h-5 bg-green-500 rounded-md shrink-0"></div>
                <span className="text-sm font-medium text-gray-700">Available</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="w-5 h-5 bg-amber-500 rounded-md shrink-0"></div>
                <span className="text-sm font-medium text-gray-700">Reserved</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="w-5 h-5 bg-red-500 rounded-md shrink-0"></div>
                <span className="text-sm font-medium text-gray-700">Sold</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="w-5 h-5 bg-blue-500 rounded-md shrink-0"></div>
                <span className="text-sm font-medium text-gray-700">Selected</span>
              </div>
            </div>
          </div>
        </div>

        {/* Details Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 sticky top-6">
            <h2 className="text-xl font-bold text-slate-800 mb-6 pb-4 border-b border-gray-200">
              Plot Details
            </h2>

            {selectedPlot ? (
              <div className="space-y-5">
                {/* Plot ID */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Plot ID</p>
                  <p className="text-2xl font-bold text-blue-900">{selectedPlot.id}</p>
                </div>

                {/* Name */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Name</label>
                  <p className="text-lg font-semibold text-slate-800">{selectedPlot.name}</p>
                </div>

                {/* Status */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Status</label>
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border font-semibold capitalize ${getStatusBadgeColor(selectedPlot.status)}`}>
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{
                        backgroundColor: getStatusColor(selectedPlot.status),
                      }}
                    ></div>
                    {selectedPlot.status}
                  </div>
                </div>

                {/* Dimensions */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Width</p>
                    <p className="text-lg font-bold text-slate-800">{selectedPlot.width}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Height</p>
                    <p className="text-lg font-bold text-slate-800">{selectedPlot.height}</p>
                  </div>
                </div>

                {/* Position */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">X Position</p>
                    <p className="text-lg font-bold text-slate-800">{selectedPlot.x}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Y Position</p>
                    <p className="text-lg font-bold text-slate-800">{selectedPlot.y}</p>
                  </div>
                </div>

                {/* Clear Button */}
                <button
                  onClick={() => setSelectedPlot(null)}
                  className="w-full mt-4 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors border border-gray-300"
                >
                  Clear Selection
                </button>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <span className="text-2xl">📍</span>
                </div>
                <p className="text-gray-600 font-medium">No Plot Selected</p>
                <p className="text-gray-500 text-sm mt-1">Click on a plot on the map to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MapView;