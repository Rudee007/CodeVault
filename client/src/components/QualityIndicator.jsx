// src/components/QualityIndicator.jsx
import React from "react";
import feather from "feather-icons";

export default function QualityIndicator({ score, breakdown = {} }) {
  React.useEffect(() => {
    feather.replace();
  }, []);

  const getScoreColor = (score) => {
    if (score >= 8) return "text-green-400 bg-green-400/20 border-green-400/30";
    if (score >= 6) return "text-yellow-400 bg-yellow-400/20 border-yellow-400/30";
    if (score >= 4) return "text-orange-400 bg-orange-400/20 border-orange-400/30";
    return "text-red-400 bg-red-400/20 border-red-400/30";
  };

  const getScoreIcon = (score) => {
    if (score >= 8) return "check-circle";
    if (score >= 6) return "info";
    if (score >= 4) return "alert-triangle";
    return "x-circle";
  };

  const metrics = [
    { key: 'readability', label: 'Readability', icon: 'eye' },
    { key: 'security', label: 'Security', icon: 'shield' },
    { key: 'performance', label: 'Performance', icon: 'zap' },
    { key: 'maintainability', label: 'Maintainability', icon: 'tool' }
  ];

  return (
    <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-white/10">
      <h3 className="flex items-center gap-2 font-semibold text-indigo-200 mb-4">
        <i data-feather="award" className="w-4 h-4"></i>
        Code Quality Score
      </h3>

      {/* Overall Score */}
      <div className={`flex items-center justify-between p-4 rounded-xl border mb-4 ${getScoreColor(score)}`}>
        <div className="flex items-center gap-3">
          <i data-feather={getScoreIcon(score)} className="w-6 h-6"></i>
          <div>
            <div className="font-bold text-lg">{score}/10</div>
            <div className="text-sm opacity-80">Overall Quality</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">{Math.round(score * 10)}%</div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      {Object.keys(breakdown).length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-400">Detailed Breakdown</h4>
          {metrics.map(metric => (
            <div key={metric.key} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <i data-feather={metric.icon} className="w-4 h-4 text-gray-400"></i>
                <span className="text-sm text-gray-300">{metric.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-16 bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      breakdown[metric.key] >= 8 ? 'bg-green-400' :
                      breakdown[metric.key] >= 6 ? 'bg-yellow-400' :
                      breakdown[metric.key] >= 4 ? 'bg-orange-400' : 'bg-red-400'
                    }`}
                    style={{ width: `${(breakdown[metric.key] || 0) * 10}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-white w-8">
                  {breakdown[metric.key]?.toFixed(1) || '0.0'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
