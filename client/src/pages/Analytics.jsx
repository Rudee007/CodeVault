// src/pages/Analytics.jsx

import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { TrendingUp, Calendar, Activity } from "react-feather";
import AOS from "aos";
import "aos/dist/aos.css";
import { snippetService } from "../services/snippetService";

const COLORS = ["#6366F1", "#14B8A6", "#FBBF24", "#EF4444", "#3B82F6", "#8B5CF6", "#EC4899", "#10B981"];

export default function Analytics({ showToast }) {
  const [loading, setLoading] = useState(true);
  const [snippets, setSnippets] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    languages: [],
    totalViews: 0,
    totalCopies: 0,
    totalFavorites: 0,
    recentActivity: [],
    languageDistribution: [],
    creationTrend: []
  });

  useEffect(() => {
    AOS.init({ once: true, duration: 600 });
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch all user's snippets
      const response = await snippetService.getMySnippets({ limit: 1000 });
      const userSnippets = response.data.snippets || [];
      
      setSnippets(userSnippets);
      
      // Calculate statistics
      const analytics = calculateAnalytics(userSnippets);
      setStats(analytics);
      
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      showToast('Failed to load analytics', true);
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = (snippets) => {
    // Language distribution
    const languageCount = {};
    snippets.forEach(snippet => {
      const lang = snippet.language || 'unknown';
      languageCount[lang] = (languageCount[lang] || 0) + 1;
    });

    const languageDistribution = Object.entries(languageCount)
      .map(([name, count]) => ({ name, snippets: count }))
      .sort((a, b) => b.snippets - a.snippets)
      .slice(0, 8); // Top 8 languages

    // Total engagement metrics
    const totalViews = snippets.reduce((sum, s) => sum + (s.engagement?.views || 0), 0);
    const totalCopies = snippets.reduce((sum, s) => sum + (s.engagement?.copies || 0), 0);
    const totalFavorites = snippets.filter(s => s.favorite).length;

    // Recent activity (last 10 updates)
    const recentActivity = snippets
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 10)
      .map(snippet => ({
        id: snippet._id,
        action: `Updated "${snippet.title}"`,
        at: formatDate(snippet.updatedAt),
        snippet
      }));

    // Creation trend (snippets per month for last 6 months)
    const creationTrend = calculateCreationTrend(snippets);

    // Most popular language
    const mostPopularLanguage = languageDistribution.length > 0 
      ? languageDistribution[0].name 
      : 'N/A';

    return {
      total: snippets.length,
      languages: Object.keys(languageCount).length,
      totalViews,
      totalCopies,
      totalFavorites,
      mostPopularLanguage,
      recentActivity,
      languageDistribution,
      creationTrend
    };
  };

  const calculateCreationTrend = (snippets) => {
    const months = {};
    const now = new Date();
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      months[key] = 0;
    }

    // Count snippets per month
    snippets.forEach(snippet => {
      const date = new Date(snippet.createdAt);
      const key = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      if (months[key] !== undefined) {
        months[key]++;
      }
    });

    return Object.entries(months).map(([month, count]) => ({ month, count }));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 bg-gradient-to-br from-indigo-950 to-cyan-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-indigo-400/20 border-t-indigo-400 rounded-full animate-spin mb-4"></div>
          <p className="text-indigo-300">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen pt-20 pb-12 px-4 bg-gradient-to-br from-indigo-950 to-cyan-900 text-white overflow-hidden">
      {/* ✅ Background decorative blobs - Glass effect */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -left-40 w-96 h-96 rounded-full bg-indigo-700/30 filter blur-3xl animate-blob"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-20 right-20 w-72 h-72 rounded-full bg-cyan-500/25 filter blur-3xl animate-blob animation-delay-2000"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-20 right-1/2 w-64 h-64 rounded-full bg-purple-600/20 filter blur-2xl animate-blob animation-delay-4000"
      />

      <div className="container mx-auto max-w-6xl space-y-8 relative z-10">
        {/* Header */}
        <section data-aos="fade-down" className="mb-6">
          <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-400 via-cyan-300 to-teal-200 
            bg-clip-text text-transparent mb-3">
            Analytics Dashboard
          </h1>
          <p className="text-indigo-300">
            Track your code snippets' usage, engagement, and productivity metrics.
          </p>
        </section>

        {/* Language Distribution & Recent Activity */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-aos="fade-up">
          {/* Language Distribution Pie Chart */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Language Distribution
            </h2>
            {stats.languageDistribution.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={stats.languageDistribution}
                      dataKey="snippets"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {stats.languageDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Legend */}
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {stats.languageDistribution.map((lang, index) => (
                    <div key={lang.name} className="flex items-center gap-2 text-sm">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-gray-300">{lang.name}: {lang.snippets}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-64 flex items-center justify-center text-indigo-300">
                No snippets yet
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent Activity
            </h2>
            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
              {stats.recentActivity.length > 0 ? (
                stats.recentActivity.map(item => (
                  <div
                    key={item.id}
                    className="bg-indigo-900/20 hover:bg-indigo-800/30 rounded-lg px-4 py-3 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm text-white">{item.action}</span>
                      <span className="text-xs text-indigo-300 whitespace-nowrap">{item.at}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs bg-indigo-500/30 px-2 py-0.5 rounded text-indigo-200">
                        {item.snippet.language}
                      </span>
                      <span className="text-xs text-gray-400">
                        {item.snippet.engagement?.views || 0} views
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-indigo-300">
                  No recent activity
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Creation Trend Chart */}
        <section className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-lg" data-aos="fade-up" data-aos-delay="100">
          <h2 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Creation Trend (Last 6 Months)
          </h2>
          {stats.creationTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={stats.creationTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#E5E7EB' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#6366F1" 
                  strokeWidth={3}
                  dot={{ fill: '#6366F1', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-indigo-300">
              No trend data available
            </div>
          )}
        </section>

        {/* Quick Insights */}
        <section className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-lg" data-aos="fade-up" data-aos-delay="200">
          <h2 className="text-xl font-bold mb-4 text-white">Quick Insights</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <InsightCard
              label="Total Snippets"
              value={stats.total}
            />
            <InsightCard
              label="Languages Used"
              value={stats.languages}
            />
            <InsightCard
              label="Most Popular"
              value={stats.mostPopularLanguage}
            />
            <InsightCard
              label="Avg Views/Snippet"
              value={stats.total > 0 ? Math.round(stats.totalViews / stats.total) : 0}
            />
            <InsightCard
              label="Favorite Rate"
              value={stats.total > 0 ? `${Math.round((stats.totalFavorites / stats.total) * 100)}%` : '0%'}
            />
          </div>
        </section>

        {/* Engagement Metrics */}
        <section className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-lg" data-aos="fade-up" data-aos-delay="300">
          <h2 className="text-xl font-bold mb-4 text-white">Engagement Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-indigo-900/20 rounded-lg p-4 border border-indigo-500/30">
              <p className="text-indigo-300 text-sm mb-1">Total Views</p>
              <p className="text-3xl font-bold text-white">{stats.totalViews}</p>
            </div>
            <div className="bg-indigo-900/20 rounded-lg p-4 border border-cyan-500/30">
              <p className="text-cyan-300 text-sm mb-1">Total Copies</p>
              <p className="text-3xl font-bold text-white">{stats.totalCopies}</p>
            </div>
            <div className="bg-indigo-900/20 rounded-lg p-4 border border-pink-500/30">
              <p className="text-pink-300 text-sm mb-1">Favorites</p>
              <p className="text-3xl font-bold text-white">{stats.totalFavorites}</p>
            </div>
          </div>
        </section>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.7);
        }
        
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </main>
  );
}

function InsightCard({ label, value }) {
  return (
    <div className="bg-indigo-900/20 rounded-lg p-4 text-center">
      <p className="text-indigo-300 text-xs mb-2">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}
