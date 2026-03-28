import React, { useState, useEffect, useRef } from "react";
import { Search, BookOpen, TrendingUp, Users, Target, BarChart3, Sparkles, Zap, Globe, ArrowRight, ChevronRight } from "lucide-react";
import { searchAPI, getRecentSearches } from "../services/api";

const HomePage = () => {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [error, setError] = useState(null);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    loadRecentSearches();
  }, []);

  const loadRecentSearches = async () => {
    try {
      const recent = await getRecentSearches(5);
      setRecentSearches(recent.map(item => item.question));
    } catch (error) {
      console.error('Failed to load recent searches:', error);
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
        setRecentSearches(prev => [searchQuery, ...prev.slice(0, 4)]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSearch = (term) => {
    setQuery(term);
    handleSearch(term);
  };

  const quickTerms = ["KPI Nedir", "Lead Generation", "Sales Funnel", "CRM Stratejisi", "Cross Selling"];

  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Anında Yanıt",
      desc: "GPT-4o ile saniyeler içinde uzman düzeyinde açıklamalar",
      color: "from-violet-500 to-purple-600",
      size: "col-span-1"
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Gerçek Örnekler",
      desc: "Her terim sahadan alınmış senaryolarla desteklenir",
      color: "from-blue-500 to-cyan-500",
      size: "col-span-1"
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Çok Dilli",
      desc: "Türkçe ve İngilizce sorularınıza anadilinde cevap",
      color: "from-emerald-500 to-teal-500",
      size: "col-span-1"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Güncel Trendler",
      desc: "2026 satış dünyasının en güncel teknik ve stratejileri",
      color: "from-orange-500 to-red-500",
      size: "col-span-1"
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "Kapsamlı Sözlük",
      desc: "A'dan Z'ye tüm satış terminolojisi tek platformda",
      color: "from-pink-500 to-rose-500",
      size: "col-span-1"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Bağlantılı Konular",
      desc: "İlgili terimler arası akıllı geçişlerle derin öğrenme",
      color: "from-indigo-500 to-blue-600",
      size: "col-span-1"
    },
  ];

  return (
    <div className="uu-root">
      {/* Ambient background */}
      <div className="uu-ambient" aria-hidden="true">
        <div className="uu-orb uu-orb-1" />
        <div className="uu-orb uu-orb-2" />
        <div className="uu-orb uu-orb-3" />
        <div className="uu-grid-overlay" />
      </div>

      {/* Header */}
      <header className="uu-header">
        <div className="uu-header-inner">
          <div className="uu-logo">
            <div className="uu-logo-icon">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="uu-logo-text">UU AI</span>
            <span className="uu-logo-badge">2026</span>
          </div>
          <nav className="uu-nav">
            <a href="#features" className="uu-nav-link">Özellikler</a>
            <a href="#admin" onClick={() => window.location.hash = '#/admin'} className="uu-nav-link">Admin</a>
            <a href="mailto:info@umitunker.com" className="uu-nav-cta">
              İletişim <ArrowRight className="w-3 h-3" />
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main>
        <section className="uu-hero">
          <div className="uu-hero-inner">
            <div className="uu-eyebrow">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Yapay Zeka Destekli Satış Rehberi</span>
            </div>

            <h1 className="uu-hero-title">
              Satış Dünyasında<br />
              <span className="uu-gradient-text">Her Sorunun Cevabı</span>
            </h1>

            <p className="uu-hero-sub">
              GPT-4o ile güçlendirilmiş akıllı satış sözlüğü. Türkçe veya İngilizce sorun,<br className="hidden md:block" />
              uzman düzeyinde, örnekli yanıtlar alın.
            </p>

            {/* Search */}
            <div className={`uu-search-wrap ${focused ? 'uu-search-focused' : ''}`}>
              <div className="uu-search-glow" />
              <div className="uu-search-box">
                <Search className="uu-search-icon" />
                <input
                  ref={inputRef}
                  type="text"
                  className="uu-search-input"
                  placeholder="Satış terimi veya sorunuzu yazın... (örn: KPI nedir?)"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  disabled={loading}
                />
                <button
                  className="uu-search-btn"
                  onClick={() => handleSearch()}
                  disabled={loading}
                >
                  {loading ? (
                    <div className="uu-spinner" />
                  ) : (
                    <>
                      <span>Ara</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick searches */}
            <div className="uu-quick">
              <span className="uu-quick-label">Popüler:</span>
              {quickTerms.map((term, i) => (
                <button
                  key={i}
                  className="uu-chip"
                  onClick={() => handleQuickSearch(term)}
                  disabled={loading}
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="uu-container">
            <div className="uu-error">
              <p>{error}</p>
              <button onClick={() => setError(null)}>Kapat</button>
            </div>
          </div>
        )}

        {/* Answer */}
        {answer && (
          <section className="uu-answer-section">
            <div className="uu-container-narrow">
              <div className="uu-answer-card">
                <div className="uu-answer-header">
                  <div className="uu-answer-badge">
                    <Sparkles className="w-3.5 h-3.5" />
                    AI Yanıtı
                  </div>
                  <h2 className="uu-answer-title">{answer.question}</h2>
                </div>

                <div className="uu-answer-body">
                  <p className="uu-answer-text">{answer.answer}</p>

                  {answer.examples && answer.examples.length > 0 && (
                    <div className="uu-answer-examples">
                      <h3 className="uu-answer-section-title">
                        <BookOpen className="w-4 h-4" /> Örnekler
                      </h3>
                      <ul className="uu-example-list">
                        {answer.examples.map((example, i) => (
                          <li key={i} className="uu-example-item">{example}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {answer.relatedTerms && answer.relatedTerms.length > 0 && (
                    <div className="uu-answer-related">
                      <h3 className="uu-answer-section-title">
                        <TrendingUp className="w-4 h-4" /> İlgili Konular
                      </h3>
                      <div className="uu-related-chips">
                        {answer.relatedTerms.map((term, i) => (
                          <button
                            key={i}
                            className="uu-related-chip"
                            onClick={() => handleQuickSearch(term)}
                            disabled={loading}
                          >
                            {term} <ChevronRight className="w-3 h-3" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Recent searches */}
        {recentSearches.length > 0 && !answer && (
          <section className="uu-recent-section">
            <div className="uu-container-narrow">
              <h3 className="uu-section-label">Son Aramalarınız</h3>
              <div className="uu-chip-row">
                {recentSearches.map((s, i) => (
                  <button key={i} className="uu-chip" onClick={() => handleQuickSearch(s)} disabled={loading}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Features */}
        <section id="features" className="uu-features-section">
          <div className="uu-container">
            <div className="uu-section-header">
              <div className="uu-eyebrow">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Özellikler</span>
              </div>
              <h2 className="uu-section-title">Neden UU AI Satış Sözlüğü?</h2>
              <p className="uu-section-sub">Satış dünyasında başarılı olmak için ihtiyacınız olan her bilgi</p>
            </div>

            <div className="uu-bento">
              {features.map((f, i) => (
                <div key={i} className="uu-bento-card">
                  <div className={`uu-bento-icon bg-gradient-to-br ${f.color}`}>
                    {f.icon}
                  </div>
                  <h3 className="uu-bento-title">{f.title}</h3>
                  <p className="uu-bento-desc">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="uu-cta-section">
          <div className="uu-container">
            <div className="uu-cta-card">
              <div className="uu-cta-glow" />
              <div className="uu-cta-content">
                <Users className="w-10 h-10 text-violet-400 mx-auto mb-4" />
                <h2 className="uu-cta-title">Satışta Fark Yaratın</h2>
                <p className="uu-cta-sub">Ümit ÜNKER'in satış uzmanlığı ile AI'ın gücünü birleştiren platform</p>
                <button className="uu-cta-btn" onClick={() => inputRef.current?.focus()}>
                  Hemen Sorgula <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="uu-footer">
        <div className="uu-container">
          <div className="uu-footer-grid">
            <div className="uu-footer-brand">
              <div className="uu-logo">
                <div className="uu-logo-icon">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="uu-logo-text">UU AI Satış Sözlüğü</span>
              </div>
              <p className="uu-footer-desc">
                Ümit ÜNKER tarafından geliştirilen AI destekli satış terminolojisi platformu.
              </p>
            </div>

            <div className="uu-footer-col">
              <h4 className="uu-footer-heading">Popüler Konular</h4>
              <ul className="uu-footer-links">
                {["Satış KPI'ları", "Lead Generation", "CRM Stratejileri", "Sales Funnel"].map((t, i) => (
                  <li key={i}>
                    <button className="uu-footer-link" onClick={() => handleQuickSearch(t)}>
                      <ChevronRight className="w-3 h-3" /> {t}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="uu-footer-col">
              <h4 className="uu-footer-heading">İletişim</h4>
              <div className="uu-footer-links">
                <a href="mailto:info@umitunker.com" className="uu-footer-link">
                  info@umitunker.com
                </a>
                <a href="https://umitunker.com" target="_blank" rel="noreferrer" className="uu-footer-link">
                  umitunker.com
                </a>
              </div>
            </div>
          </div>

          <div className="uu-footer-bottom">
            <p>© 2026 UU AI Satış Sözlüğü. Tüm hakları saklıdır. · Ümit ÜNKER</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
