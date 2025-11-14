import React, { useState } from 'react';
import  plotsData from "../data/PlotsData.jsx";
import mapSvg from '../assets/map.svg';

function MapView() {
  const [selectedPlot, setSelectedPlot] = useState(null);
  const [hoveredPlot, setHoveredPlot] = useState(null);

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

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Map View</h1>
        <p className="text-gray-600 mt-2">Click on plots to view details</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Section */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-4">
          <div className="relative w-full overflow-auto">
            <svg
              viewBox="0 0 567 546"
              className="w-full h-auto border border-gray-200 rounded"
              style={{ minHeight: '500px' }}
            >
              {/* Background Image */}
              <image href={mapSvg} width="567" height="546" opacity="0.3" />

              {/* Interactive Plots */}
              {plotsData.map((plot) => (
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
                      selectedPlot?.id === plot.id ? 0.8 : hoveredPlot?.id === plot.id ? 0.7 : 0.5
                    }
                    stroke={
                      selectedPlot?.id === plot.id
                        ? '#1d4ed8'
                        : hoveredPlot?.id === plot.id
                        ? '#ffffff'
                        : '#000000'
                    }
                    strokeWidth={selectedPlot?.id === plot.id ? 3 : 1.5}
                    style={{ cursor: 'pointer' }}
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
                      fontSize="10"
                      fontWeight="bold"
                      pointerEvents="none"
                    >
                      {plot.name}
                    </text>
                  )}
                </g>
              ))}
            </svg>
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-4 justify-center">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm text-gray-700">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-amber-500 rounded"></div>
              <span className="text-sm text-gray-700">Reserved</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-sm text-gray-700">Sold</span>
            </div>
          </div>
        </div>

        {/* Details Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-lg p-6 sticky top-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Plot Details</h2>

            {selectedPlot ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-600">Plot ID</label>
                  <p className="text-lg text-gray-800">{selectedPlot.id}</p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-600">Name</label>
                  <p className="text-lg text-gray-800">{selectedPlot.name}</p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-600">Status</label>
                  <div className="flex items-center gap-2 mt-1">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor: getStatusColor(selectedPlot.status),
                      }}
                    ></div>
                    <span className="text-lg text-gray-800 capitalize">{selectedPlot.status}</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-600">Dimensions</label>
                  <p className="text-lg text-gray-800">
                    {selectedPlot.width} × {selectedPlot.height}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-600">Position</label>
                  <p className="text-lg text-gray-800">
                    X: {selectedPlot.x}, Y: {selectedPlot.y}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedPlot(null)}
                  className="w-full mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                  Clear Selection
                </button>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <svg
                  className="w-16 h-16 mx-auto mb-4 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                  />
                </svg>
                <p>Select a plot to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MapView;