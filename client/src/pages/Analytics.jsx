import React, { useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import feather from "feather-icons";
import AOS from "aos";
import "aos/dist/aos.css";

const COLORS = ["#6366F1", "#14B8A6", "#FBBF24", "#EF4444", "#3B82F6"];
const demoLanguages = [
  { name: "JavaScript", snippets: 28 },
  { name: "Python", snippets: 14 },
  { name: "SQL", snippets: 9 },
  { name: "HTML", snippets: 6 },
  { name: "JSON", snippets: 3 },
];

const demoActivity = [
  { id: 1, action: "Shared snippet 'JWT Token Generator'", at: "2025-07-31 14:20" },
  { id: 2, action: "Pinned snippet 'React Carousel Hook'", at: "2025-07-30 11:02" },
  { id: 3, action: "Favorited snippet 'MongoDB Connect String'", at: "2025-07-29 09:16" },
  { id: 4, action: "Read shared snippet 'SQL Join Tricks'", at: "2025-07-28 17:40" },
  { id: 5, action: "Deleted snippet 'Old API Auth Code'", at: "2025-07-27 22:15" },
];

const overallStatsDetail = [
  { title: "Total Snippets", value: 250, icon: "codesandbox", description: "All snippets created over time" },
  { title: "Active Users", value: 120, icon: "users", description: "Users actively engaging with snippets" },
  { title: "Shared Snippets", value: 43, icon: "share-2", description: "Snippets shared publicly or privately" },
  { title: "Total Accesses", value: 320, icon: "bar-chart-2", description: "All snippet accesses logged" },
  { title: "Most Popular Language", value: "JavaScript", icon: "star", description: "Language with the most snippets" },
];

export default function Analytics() {
  useEffect(() => {
    feather.replace();
    AOS.init({ once: true });
  }, []);

  return (
    <main className="relative min-h-screen pt-10 px-4 pb-16 bg-[#1a1d27] text-white overflow-hidden">
      {/* Background decorative blobs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -left-40 w-96 h-96 rounded-full bg-indigo-700/30 filter blur-3xl animate-blob"
      ></div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-20 right-20 w-72 h-72 rounded-full bg-cyan-500/25 filter blur-3xl animate-blob animation-delay-2000"
      ></div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-20 right-1/2 w-64 h-64 rounded-full bg-purple-600/20 filter blur-2xl animate-blob animation-delay-4000"
      ></div>

      <div className="container mx-auto max-w-5xl space-y-14 relative z-10">
        {/* Header */}
        <section data-aos="fade-down" className="mb-6">
          <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-400 via-cyan-300 to-teal-200 
            bg-clip-text text-transparent mb-3">
            Snippet Analytics
          </h1>
          <p className="text-indigo-300 max-w-xl">
            Track your code snippets' shares, usage, and engagement metrics to optimize your workflow productivity.
          </p>
        </section>

        {/* Language Usage & Activity */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8" data-aos="fade-up">
          {/* Language Usage */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-lg text-center feature-card hover:scale-[1.02] transition-transform">
            <h2 className="text-lg mb-4 font-semibold text-indigo-300">Snippets by Language</h2>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={demoLanguages}
                  dataKey="snippets"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  fill="#8884d8"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {demoLanguages.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Activity */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-lg feature-card hover:scale-[1.02] transition-transform">
            <h2 className="text-lg mb-4 font-semibold text-indigo-300">Recent Activity</h2>
            <ul className="space-y-3 max-h-64 overflow-y-auto">
              {demoActivity.map(item => (
                <li
                  key={item.id}
                  className="flex items-center gap-3 bg-indigo-900/15 rounded px-4 py-3 font-mono text-sm hover:bg-indigo-800/30 cursor-default select-text"
                >
                  <i data-feather="activity" className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                  <span className="text-white">{item.action}</span>
                  <time className="ml-auto text-xs text-indigo-300">{item.at}</time>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Overall Stats */}
        <section
          data-aos="fade-up"
          className="bg-white/5 backdrop-blur-md border border-white/10 feature-card rounded-2xl p-6 shadow-lg grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-8 text-center text-indigo-300"
        >
          {overallStatsDetail.map(({ title, value, icon, description }, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <i data-feather={icon} className="w-10 h-10 mb-2 text-indigo-400" />
              <h3 className="text-3xl font-bold text-white">{value}</h3>
              <p className="font-semibold mb-1">{title}</p>
              <p className="text-xs">{description}</p>
            </div>
          ))}
        </section>

        {/* Usage Trends */}
        <section
          data-aos="fade-up"
          className="feature-card bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-lg"
        >
          <h2 className="text-xl font-bold mb-4 text-indigo-300">Usage Trends Over Time</h2>
          <p className="mb-4 text-indigo-400 text-sm">
            Visualize snippet creation and accesses trends for better planning.
          </p>
          <div className="w-full h-40 bg-indigo-900/30 rounded-lg flex items-center justify-center text-indigo-500 text-sm italic select-none">
            Chart Placeholder (Add your time-series chart here)
          </div>
        </section>

        {/* Top Contributors */}
        <section
          data-aos="fade-up"
          className="feature-card bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-lg"
        >
          <h2 className="text-xl font-bold mb-4 text-indigo-300">Top Contributors</h2>
          <ul className="divide-y divide-indigo-700 max-h-48 overflow-y-auto text-sm text-white">
            <li className="py-2 flex justify-between">
              <span>Jane Doe</span>
              <span>45 Snippets</span>
            </li>
            <li className="py-2 flex justify-between">
              <span>John Smith</span>
              <span>38 Snippets</span>
            </li>
            <li className="py-2 flex justify-between">
              <span>Mary Johnson</span>
              <span>27 Snippets</span>
            </li>
            <li className="py-2 flex justify-between">
              <span>Michael Brown</span>
              <span>22 Snippets</span>
            </li>
            <li className="py-2 flex justify-between">
              <span>Lisa White</span>
              <span>19 Snippets</span>
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}
