// src/pages/Analytics.jsx

import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import feather from "feather-icons";
import AOS from "aos";
import "aos/dist/aos.css";
import Navbar from "../components/Navbar";

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

export default function Analytics({ showToast }) {
  const [themeDark, setThemeDark] = useState(() => localStorage.getItem("theme") !== "light");

  useEffect(() => {
    feather.replace();
    AOS.init({ once: true });
  }, [themeDark]);

  const toggleTheme = () => {
    setThemeDark(prev => {
      localStorage.setItem("theme", !prev ? "dark" : "light");
      return !prev;
    });
  };

  return (
    <>
     

      <main className={`min-h-screen pt-10 px-4 pb-16 bg-gradient-to-br from-indigo-950 to-cyan-900 ${themeDark ? "text-white" : "text-gray-900"}`}>
        <div className="container mx-auto max-w-5xl space-y-10">
          <section data-aos="fade-down" className="mb-6">
            <h1 className="text-3xl font-black bg-gradient-to-r from-indigo-400 via-cyan-300 to-teal-200 bg-clip-text text-transparent mb-3">
              Snippet Analytics
            </h1>
            <p className="text-indigo-300 max-w-xl">
              Track your code snippets' shares, usage, and engagement metrics to optimize your workflow productivity.
            </p>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-8" data-aos="fade-up">
            {/* Language usage pie chart */}
            <div className="bg-[#1a1d27] p-6 rounded-2xl feature-card shadow-lg text-center">
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

            {/* Recent activities */}
            <div className="bg-[#1a1d27] p-6 rounded-2xl feature-card shadow-lg">
              <h2 className="text-lg mb-4 font-semibold text-indigo-300">Recent Activity</h2>
              <ul className="space-y-3 max-h-64 overflow-y-auto">
                {demoActivity.map(item => (
                  <li key={item.id} className="flex items-center gap-3 bg-white/10 rounded px-4 py-3 font-mono text-sm hover:bg-white/20 cursor-default select-text">
                    <i data-feather="activity" className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                    <span>{item.action}</span>
                    <time className="ml-auto text-xs text-indigo-300">{item.at}</time>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Overall stats */}
          <section data-aos="fade-up" className="bg-[#1a1d27] feature-card rounded-2xl p-6 shadow-lg grid grid-cols-1 sm:grid-cols-3 gap-6 text-center text-indigo-300">
            <div>
              <h3 className="text-4xl font-bold text-white">125</h3>
              <p>Snippets Created</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold text-white">43</h3>
              <p>Snippets Shared</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold text-white">320</h3>
              <p>Total Accesses</p>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
