import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "../styles/Home.module.css";
import AOS from "aos";
import "aos/dist/aos.css";
import feather from "feather-icons";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [themeDark, setThemeDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved !== "light"; // default dark mode
  });
  const [carouselIndex, setCarouselIndex] = useState(0);

  const carouselData = [
    "“Quickly connect to MongoDB and fetch data.”",
    "“Generate JWT tokens securely for REST APIs.”",
    "“Sort JavaScript arrays by custom comparator.”",
    "“Responsive React hook for mobile detection.”",
    "“Hash passwords with bcrypt in Node.js.”",
  ];

  useEffect(() => {
    AOS.init();
    feather.replace();

    const interval = setInterval(() => {
      setCarouselIndex((idx) => (idx + 1) % carouselData.length);
    }, 3100);

    updateBodyTheme(themeDark);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    updateBodyTheme(themeDark);
  }, [themeDark]);

  function updateBodyTheme(isDark) {
    const darkClasses = [
      styles.bgGradientToBr,
      styles.fromColorDark1,
      styles.toColorDark2,
      styles.textWhite,
    ];
    const lightClasses = [
      styles.bgGradientToBr,
      styles.fromColorLight1,
      styles.toColorLight2,
      styles.textGray800,
    ];
    if (isDark) {
      document.body.classList.remove(...lightClasses);
      document.body.classList.add(...darkClasses);
    } else {
      document.body.classList.remove(...darkClasses);
      document.body.classList.add(...lightClasses);
    }
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }

  function toggleTheme() {
    setThemeDark((dark) => !dark);
  }

  function openModal() {
    setIsModalOpen(true);
  }
  function closeModal() {
    setIsModalOpen(false);
  }
  function onSaveSnippet(e) {
    e.preventDefault();
    setIsModalOpen(false);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000);
  }

  return (
    <>
      

      {/* Hero */}
      <section className="hero relative text-center py-24 sm:py-28 px-4 flex flex-col items-center justify-center">
        {/* Blob background */}
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div
            className="w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-indigo-500/30 via-cyan-400/20 to-purple-400/20 filter blur-[120px] opacity-50 absolute left-1/2 transform -translate-x-1/2 top-0 animate-blob"
            aria-hidden="true"
          ></div>
        </div>
        <h2
          className="text-4xl sm:text-5xl font-extrabold mb-6 bg-gradient-to-r from-indigo-400 via-cyan-300 to-teal-200 bg-clip-text text-transparent drop-shadow-lg animate-fadein"
          data-aos="zoom-in"
        >
          Securely Store, Organize & Share Your Code
        </h2>
        <p
          className="text-base sm:text-lg text-gray-300 mb-8 max-w-xl mx-auto opacity-90 animate-fadein"
          data-aos="fade-up"
        >
          The encrypted, smart snippet manager for productive developers. Search,
          encrypt, share, and AI-summarize your code – anywhere, anytime.
        </p>
        {/* AI Carousel Demo */}
        <div className="w-full flex justify-center mb-8">
          <div className="rounded-xl px-7 py-3 bg-white/10 backdrop-blur-md inline-block shadow shadow-cyan-950/10 animate-slideIn">
            <span className="text-indigo-300 font-mono" id="ai-carousel" aria-live="polite">
              🔄 {carouselData[carouselIndex]}
            </span>
          </div>
        </div>
        <div
          className="flex flex-col sm:flex-row items-center gap-4"
          data-aos="fade-up"
          data-aos-delay="300"
        >
          <Link
            to="/signup"
            className="bg-gradient-to-r from-indigo-500 to-cyan-400 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:scale-105 transition-all btn"
            aria-label="Get Started"
          >
            Get Started
          </Link>
          <Link
            to="#features"
            className="border border-indigo-400 text-indigo-400 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-500 hover:text-white transition-all btn"
            aria-label="Learn More"
          >
            Learn More
          </Link>
        </div>
      </section>

      {/* Responsive Animated Search Bar */}
      <div
        className="max-w-xl mx-auto mb-6 flex items-center justify-center px-2 animate-fadein"
        data-aos="fade-down"
        data-aos-delay="500"
      >
        <input
          type="text"
          className="w-full px-5 py-3 rounded-l-lg bg-white/10 text-indigo-100 focus:outline-none focus:bg-white/20 placeholder-gray-400 transition"
          placeholder="Search code snippets…"
          aria-label="Search Code Snippets"
        />
        <button
          className="bg-indigo-500 px-6 py-3 rounded-r-lg text-white font-bold hover:bg-cyan-400 focus:outline-none transition"
          type="button"
          aria-label="Search"
        >
          <i data-feather="search"></i>
        </button>
      </div>

      {/* Floating Action Button (FAB) */}
      <button
        id="fab"
        className="fixed bottom-8 right-8 bg-gradient-to-br from-indigo-600 to-cyan-500 shadow-2xl rounded-full w-16 h-16 flex items-center justify-center text-white text-2xl hover:scale-105 transition-all z-40 group"
        aria-label="Add New Snippet"
        type="button"
        onClick={openModal}
      >
        <i data-feather="plus"></i>
      </button>

      {/* Add Snippet Modal */}
      <div
        id="addSnippetModal"
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[999] ${
          isModalOpen ? "" : "hidden"
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="addSnippetTitle"
      >
        <div className="bg-[#1a1d27] rounded-2xl max-w-md w-full p-8 shadow-2xl relative animate-fadein">
          <button
            id="closeModal"
            className="absolute top-3 right-4 text-white/40 hover:text-indigo-300 transition"
            aria-label="Close Add Snippet Modal"
            type="button"
            onClick={closeModal}
          >
            <i data-feather="x"></i>
          </button>
          <h3 className="text-2xl font-bold mb-5 text-indigo-200" id="addSnippetTitle">
            Add a Snippet
          </h3>
          <form className="space-y-4" onSubmit={onSaveSnippet}>
            <input
              type="text"
              className="w-full px-4 py-2 bg-white/10 rounded focus:outline-indigo-300"
              placeholder="Snippet Title"
              required
            />
            <textarea
              rows="4"
              className="w-full px-4 py-2 bg-white/10 rounded focus:outline-indigo-300 resize-y"
              placeholder="Your Code"
              required
            ></textarea>
            <input
              type="text"
              className="w-full px-4 py-2 bg-white/10 rounded focus:outline-indigo-300"
              placeholder="Tags (comma separated)"
            />
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="encrypt"
                className="accent-indigo-400"
                name="encrypt"
              />
              <label htmlFor="encrypt" className="text-gray-300 text-sm">
                Encrypt
              </label>
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-500 to-cyan-400 text-white px-5 py-2 rounded-lg font-semibold mt-2 hover:scale-105 transition"
            >
              Save Snippet
            </button>
          </form>
        </div>
      </div>

      {/* Toast Notification */}
      <div
        id="toast"
        className={`fixed bottom-[90px] right-8 px-4 py-2 bg-indigo-700/90 text-white rounded-lg shadow-lg transition-opacity z-[1001] ${
          toastVisible ? "" : "hidden"
        }`}
        role="status"
        aria-live="polite"
      >
        Snippet saved!
      </div>

      {/* Features Section */}
      <section
        id="features"
        className="py-20 px-4 sm:px-6 bg-[#13172a]/60 backdrop-blur-lg"
      >
        <div className="max-w-6xl mx-auto">
          <h3
            className="text-3xl font-bold text-center mb-12 text-indigo-200"
            data-aos="fade-down"
          >
            Powerful Features for Developers
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
            {/* Feature cards */}
            <FeatureCard
              icon="lock"
              iconClass="text-indigo-400 animate-bounce-slow"
              title="AES-256 Encryption"
              description="Encrypt individual snippets with bank-grade security."
              listItems={[
                "Master or per-snippet password",
                "Only you hold the key",
              ]}
              aosDelay={0}
            />
            <FeatureCard
              icon="cpu"
              iconClass="text-cyan-300 animate-spin-slow"
              title="AI Code Summaries"
              description="Snippets are auto-summarized via OpenAI for fast recall."
              aosDelay={100}
            />
            <FeatureCard
              icon="hash"
              iconClass="text-purple-300 animate-bounce-slow"
              title="Tag Organization"
              description="Filter and retrieve snippets via tags and categories."
              aosDelay={200}
            />
            <FeatureCard
              icon="share-2"
              iconClass="text-pink-400 animate-pulse"
              title="Secure Sharing"
              description="Generate expiring, password-protected share links."
              aosDelay={300}
            />
            <FeatureCard
              icon="layout"
              iconClass="text-teal-300 animate-bounce-slow"
              title="Minimal Developer UI"
              description="Blazing fast and distraction-free for everyday workflows."
              aosDelay={400}
            />
            <FeatureCard
              icon="cloud"
              iconClass="text-cyan-400 animate-bounce-slow"
              title="Cloud Sync & Access"
              description="Access and manage your code snippets securely from anywhere."
              aosDelay={500}
            />
          </div>
        </div>
      </section>

      {/* Why Love CodeVault Section */}
      <section
        id="why"
        className="py-16 px-4 max-w-5xl mx-auto"
        aria-label="Why Love CodeVault"
      >
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-cyan-300 mb-2">
            Why Developers Love CodeVault
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            It’s more than just a snippets locker – it’s your encrypted,
            AI-powered workflow companion.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch">
          <WhyCard
            icon="shield"
            iconColor="text-cyan-400"
            title="Zero-Knowledge Security"
            description="Only you can decrypt – not even our servers have the keys."
          />
          <WhyCard
            icon="star"
            iconColor="text-yellow-400"
            title="Favorites & Pinning"
            description="Pin and star favorites for lightning-fast recall."
          />
          <WhyCard
            icon="send"
            iconColor="text-indigo-300"
            title="Quick Copy & Bulk Export"
            description="Copy single or multiple code blocks instantly, with visual feedback."
          />
          <WhyCard
            icon="activity"
            iconColor="text-rose-300"
            title="Analytics & Activity"
            description="Track snippet shares and usage for peace of mind & productivity."
          />
        </div>
      </section>

      {/* Testimonial Banner */}
      <div
        className="py-5 bg-white/5 text-center text-indigo-200 font-medium tracking-wide shadow-inner animate-fadein"
        data-aos="fade-in"
      >
        <span>⭐️ Trusted by 1,000+ developers worldwide</span>
      </div>

      {/* About Section */}
      <section
        id="about"
        className="py-20 px-6 bg-[#0f1117]/60 text-center relative"
      >
        <div
          className="absolute left-0 right-0 -top-28 mx-auto w-32 h-32 z-0 pointer-events-none"
          aria-hidden="true"
        >
          <img
            src="https://undraw.co/api/svg?search=security"
            alt=""
            className="opacity-10 animate-fadein-parallax"
            aria-hidden="true"
          />
        </div>
        <div className="max-w-3xl mx-auto relative z-10" data-aos="fade-up">
          <h3 className="text-3xl font-bold mb-6 text-cyan-100">
            Built for Developers, by Developers
          </h3>
          <p className="text-gray-300">
            CodeVault is your encrypted, AI-powered second brain for code.
            Minimal, secure, and designed for creative productivity.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1f2330]/80 backdrop-blur pt-8 pb-6 text-center text-xs text-gray-400">
        <p>&copy; 2025 CodeVault. All rights reserved.</p>
      </footer>
    </>
  );
}

function FeatureCard({ icon, iconClass, title, description, listItems, aosDelay }) {
  return (
    <div
      className="feature-card bg-white/10 backdrop-blur-lg border border-indigo-200/20 rounded-2xl p-8 transition hover:scale-105 hover:border-indigo-300 shadow shadow-indigo-900/15"
      data-aos="fade-up"
      data-aos-delay={aosDelay}
      tabIndex={0}
    >
      <div className="flex justify-center mb-3">
        <i data-feather={icon} className={`w-8 h-8 ${iconClass}`}></i>
      </div>
      <h4 className="text-xl font-bold mb-2">{title}</h4>
      <p className="text-gray-300 text-sm">{description}</p>
      {listItems && (
        <ul className="text-gray-400 text-xs mt-2 list-disc ml-5">
          {listItems.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function WhyCard({ icon, iconColor, title, description }) {
  return (
    <div className="p-6 bg-white/10 rounded-2xl shadow feature-card transition hover:scale-105" tabIndex={0}>
      <i data-feather={icon} className={`w-7 h-7 mb-2 ${iconColor}`}></i>
      <h4 className="font-bold mb-1">{title}</h4>
      <p className="text-gray-200 text-sm">{description}</p>
    </div>
  );
}
