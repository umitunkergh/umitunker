import React, { useState, useEffect } from "react";
import {
  Search, BookOpen, TrendingUp, Users, Target, BarChart3,
  Zap, Globe, ArrowRight, Clock, Sparkles
} from "lucide-react";
import { searchAPI, getRecentSearches } from "../services/api";

const QUICK_SEARCHES = ["KPI Nedir", "Lead Generation", "Sales Funnel", "CRM Stratejisi", "Cross Selling"];

const FEATURES = [
  {
    icon: Zap,
    title: "Hızlı Yanıtlar",
    desc: "Saniyeler içinde detaylı ve örnekli açıklamalar alın",
    color: "#F59E0B",
  },
  {
    icon: Target,
    title: "Örnekli Açıklamalar",
    desc: "Her terim gerçek satış senaryolarıyla desteklenir",
    color: "#10B981",
  },
  {
    icon: TrendingUp,
    title: "Güncel İçerik",
    desc: "Modern satış teknikleri ve stratejileriyle güncel kalın",
    color: "#6366F1",
  },
  {
    icon: Globe,
    title: "Çok Dilli Destek",
    desc: "Hangi dilde sorarsanız, o dilde cevap alın",
    color: "#3B82F6",
  },
  {
    icon: BookOpen,
    title: "Kapsamlı Sözlük",
    desc: "Satışın A'sından Z'sine tüm terimleri kapsayan rehber",
    color: "#8B5CF6",
  },
  {
    icon: Search,
    title: "Akıllı Arama",
    desc: "AI destekli arama ile en ilgili sonuçları bulun",
    color: "#EF4444",
  },
];

const FOOTER_TOPICS = [
  "Satış KPI'ları",
  "Lead Generation",
  "CRM Stratejileri",
  "Sales Funnel",
];

const HomePage = () => {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadRecentSearches();
  }, []);

  const loadRecentSearches = async () => {
    try {
      const recent = await getRecentSearches(5);
      setRecentSearches(recent.map((item) => item.question));
    } catch (err) {
      console.error("Failed to load recent searches:", err);
    }
  };

  const handleSearch = async (searchQuery = query) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const result = await searchAPI(searchQuery);
      setAnswer(result);

      if (!recentSearches.includes(searchQuery)) {
        setRecentSearches((prev) => [searchQuery, ...prev.slice(0, 4)]);
      }
    } catch (err) {
      setError(err.message);
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSearch = (term) => {
    setQuery(term);
    handleSearch(term);
  };

  return (
    <div className="min-h-screen" style={{ background: "#F8FAFF" }}>

      {/* ── NAVBAR ── */}
      <nav className="navbar">
        <div className="navbar-inner">
          <div className="navbar-brand">
            <div className="navbar-logo">
              <BookOpen size={18} color="white" />
            </div>
            <div>
              <div className="navbar-title">UU AI</div>
              <div className="navbar-subtitle">Satış Sözlüğü</div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", display: "flex", alignItems: "center", gap: 6 }}>
              <Sparkles size={14} color="#818CF8" />
              GPT-4o destekli
            </span>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="hero-section" style={{ padding: "80px 0 96px" }}>
        <div className="container-narrow" style={{ position: "relative", zIndex: 1, textAlign: "center" }}>

          {/* Badge */}
          <div className="animate-slide-up" style={{ display: "flex", justifyContent: "center" }}>
            <div className="hero-badge">
              <div className="hero-badge-dot" />
              AI destekli · Türkçe &amp; İngilizce
            </div>
          </div>

          {/* Headline */}
          <h1 className="display-hero animate-slide-up" style={{ animationDelay: "0.05s", marginBottom: 20 }}>
            Satış Dünyasında<br />
            <span className="gradient-text">Her Sorunun Yanıtı</span>
          </h1>

          <p className="body-large animate-slide-up"
            style={{ animationDelay: "0.1s", color: "rgba(255,255,255,0.6)", marginBottom: 40 }}>
            Ümit ÜNKER'in AI destekli satış terminolojisi rehberi
          </p>

          {/* Search Box */}
          <div className="search-container animate-slide-up" style={{ animationDelay: "0.15s" }}>
            <input
              type="text"
              className="search-input"
              placeholder="Satış ile ilgili sorunuzu yazın… (örn: KPI nedir?)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              disabled={loading}
            />
            <button
              className="search-button"
              onClick={() => handleSearch()}
              disabled={loading}
            >
              {loading ? (
                <div className="loading-dots">
                  <div className="loading-dot" />
                  <div className="loading-dot" />
                  <div className="loading-dot" />
                </div>
              ) : (
                <Search size={18} />
              )}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="animate-slide-up" style={{
              marginTop: 20,
              padding: "14px 20px",
              background: "rgba(239,68,68,0.15)",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: 12,
              color: "#FCA5A5",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}>
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                style={{ background: "none", border: "none", color: "#FCA5A5", cursor: "pointer", fontSize: 12, flexShrink: 0 }}
              >
                Kapat
              </button>
            </div>
          )}

          {/* Quick searches */}
          <div className="animate-slide-up" style={{ animationDelay: "0.2s", marginTop: 32 }}>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 14 }}>Popüler aramalar:</p>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10 }}>
              {QUICK_SEARCHES.map((term, i) => (
                <button
                  key={i}
                  onClick={() => handleQuickSearch(term)}
                  className="btn-secondary"
                  disabled={loading}
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          {/* Stats bar */}
          <div className="stats-bar animate-slide-up" style={{ animationDelay: "0.25s" }}>
            <div className="stat-item">
              <div className="stat-value">GPT-4o</div>
              <div className="stat-label">AI Motor</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">TR / EN</div>
              <div className="stat-label">Dil Desteği</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">7/24</div>
              <div className="stat-label">Erişim</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ANSWER ── */}
      {answer && (
        <section style={{ padding: "64px 0", background: "#F1F5F9" }}>
          <div className="container-narrow">
            <div className="answer-card animate-slide-up">
              {/* Question heading */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 20 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                  background: "linear-gradient(135deg, #6366F1, #3B82F6)",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  <Sparkles size={18} color="white" />
                </div>
                <h2 className="heading-medium" style={{ margin: 0, lineHeight: 1.3 }}>{answer.question}</h2>
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: "#E2E8F0", marginBottom: 20 }} />

              {/* Answer text */}
              <div className="body-standard" style={{ lineHeight: 1.8, whiteSpace: "pre-line", marginBottom: 24 }}>
                {answer.answer}
              </div>

              {/* Examples */}
              {answer.examples && answer.examples.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: "#0F172A", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 16 }}>📚</span> Örnekler
                  </h3>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                    {answer.examples.map((ex, i) => (
                      <li key={i} style={{
                        padding: "12px 16px",
                        background: "#F8FAFF",
                        borderLeft: "3px solid #6366F1",
                        borderRadius: "0 10px 10px 0",
                        fontSize: 15,
                        color: "#475569",
                        lineHeight: 1.6,
                      }}>
                        {ex}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Related terms */}
              {answer.relatedTerms && answer.relatedTerms.length > 0 && (
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: "#0F172A", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 16 }}>🔗</span> İlgili Konular
                  </h3>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {answer.relatedTerms.map((term, i) => (
                      <button
                        key={i}
                        onClick={() => handleQuickSearch(term)}
                        disabled={loading}
                        style={{
                          padding: "6px 14px",
                          background: "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(59,130,246,0.08))",
                          border: "1px solid rgba(99,102,241,0.2)",
                          borderRadius: 100,
                          fontSize: 13,
                          fontWeight: 500,
                          color: "#4F46E5",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <ArrowRight size={12} />
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── FEATURES ── */}
      <section style={{ padding: "96px 0", background: "#FFFFFF" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <h2 className="heading-large" style={{ marginBottom: 12 }}>Neden UU AI Satış Sözlüğü?</h2>
            <p className="body-large">Satış dünyasında başarılı olmak için ihtiyacınız olan her bilgi</p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 24,
          }}>
            {FEATURES.map(({ icon: Icon, title, desc, color }, i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon">
                  <Icon size={24} color={color} />
                </div>
                <h3 className="heading-medium" style={{ marginBottom: 10 }}>{title}</h3>
                <p className="body-standard">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RECENT SEARCHES ── */}
      {recentSearches.length > 0 && (
        <section style={{ padding: "64px 0", background: "#F8FAFF" }}>
          <div className="container-narrow" style={{ textAlign: "center" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 24 }}>
              <Clock size={16} color="#6366F1" />
              <h3 style={{ fontSize: 18, fontWeight: 600, color: "#0F172A", margin: 0 }}>Son Aramalarınız</h3>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10 }}>
              {recentSearches.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleQuickSearch(s)}
                  disabled={loading}
                  style={{
                    padding: "10px 20px",
                    background: "#FFFFFF",
                    border: "1px solid #E2E8F0",
                    borderRadius: 100,
                    fontSize: 14,
                    fontWeight: 500,
                    color: "#4F46E5",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── FOOTER ── */}
      <footer style={{ background: "#0F172A", padding: "64px 0 32px" }}>
        <div className="container">
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 40,
            marginBottom: 48,
          }}>
            {/* Brand */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: "linear-gradient(135deg, #6366F1, #3B82F6)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <BookOpen size={18} color="white" />
                </div>
                <span style={{ fontWeight: 700, fontSize: 16, color: "white" }}>UU AI Satış Sözlüğü</span>
              </div>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, margin: 0 }}>
                Ümit ÜNKER tarafından geliştirilen AI destekli satış terminolojisi platformu.
              </p>
            </div>

            {/* Popular Topics */}
            <div>
              <h4 style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Popüler Konular
              </h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                {FOOTER_TOPICS.map((topic, i) => (
                  <li key={i}>
                    <a
                      href="#"
                      onClick={(e) => { e.preventDefault(); handleQuickSearch(topic); }}
                      style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", textDecoration: "none", transition: "color 0.2s" }}
                      onMouseEnter={(e) => (e.target.style.color = "#818CF8")}
                      onMouseLeave={(e) => (e.target.style.color = "rgba(255,255,255,0.5)")}
                    >
                      {topic}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                İletişim
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", margin: 0 }}>info@umitunker.com</p>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", margin: 0 }}>www.umitunker.com</p>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{
            borderTop: "1px solid rgba(255,255,255,0.08)",
            paddingTop: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", margin: 0 }}>
              © 2025 UU AI Satış Sözlüğü. Tüm hakları saklıdır.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
