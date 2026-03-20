import React, { useState, useEffect } from "react";
import {
  BarChart3, Users, Search, TrendingUp, Globe, Calendar,
  Trash2, RefreshCw, Eye, Clock
} from "lucide-react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api/admin`;

const TABS = [
  { id: "dashboard",  label: "Dashboard",        icon: BarChart3  },
  { id: "analytics",  label: "Analytics",         icon: TrendingUp },
  { id: "questions",  label: "Popüler Sorular",   icon: Search     },
  { id: "sessions",   label: "Oturumlar",          icon: Users      },
  { id: "settings",   label: "Ayarlar",            icon: Globe      },
];

/* ──────────────────────────────────────────── */
/*  Sub-components                              */
/* ──────────────────────────────────────────── */

const STAT_COLORS = {
  blue:   { bg: "rgba(99,102,241,0.08)",  accent: "#6366F1",  text: "#4F46E5"  },
  green:  { bg: "rgba(16,185,129,0.08)",  accent: "#10B981",  text: "#059669"  },
  purple: { bg: "rgba(139,92,246,0.08)",  accent: "#8B5CF6",  text: "#7C3AED"  },
  orange: { bg: "rgba(245,158,11,0.08)",  accent: "#F59E0B",  text: "#D97706"  },
};

const StatCard = ({ title, value, icon: Icon, description, color = "blue" }) => {
  const c = STAT_COLORS[color] || STAT_COLORS.blue;
  return (
    <div style={{
      background: "#FFFFFF",
      border: "1px solid #E2E8F0",
      borderRadius: 16,
      padding: "24px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16,
      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      transition: "box-shadow 0.2s ease",
    }}>
      <div>
        <p style={{ fontSize: 13, fontWeight: 500, color: "#64748B", margin: "0 0 6px" }}>{title}</p>
        <p style={{ fontSize: 32, fontWeight: 700, color: c.text, margin: "0 0 4px", lineHeight: 1 }}>{value}</p>
        {description && <p style={{ fontSize: 12, color: "#94A3B8", margin: 0 }}>{description}</p>}
      </div>
      <div style={{
        width: 52, height: 52, borderRadius: 14,
        background: c.bg,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <Icon size={24} color={c.accent} />
      </div>
    </div>
  );
};

/* ──────────────────────────────────────────── */
/*  Main Component                              */
/* ──────────────────────────────────────────── */

const AdminDashboard = () => {
  const [dashboardStats, setDashboardStats] = useState(null);
  const [trends, setTrends] = useState([]);
  const [popularQuestions, setPopularQuestions] = useState([]);
  const [languageDistribution, setLanguageDistribution] = useState({});
  const [sessionActivity, setSessionActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, trendsRes, popularRes, langRes, sessionsRes] = await Promise.all([
        axios.get(`${API}/dashboard/stats`),
        axios.get(`${API}/analytics/trends?days=7`),
        axios.get(`${API}/analytics/popular?limit=15`),
        axios.get(`${API}/analytics/languages`),
        axios.get(`${API}/sessions/activity?limit=30`),
      ]);

      setDashboardStats(statsRes.data);
      setTrends(trendsRes.data.trends);
      setPopularQuestions(popularRes.data.popular_questions);
      setLanguageDistribution(langRes.data.language_distribution);
      setSessionActivity(sessionsRes.data.session_activity);
    } catch (error) {
      console.error("Admin data loading error:", error);
    } finally {
      setLoading(false);
    }
  };

  const cleanupOldData = async (days) => {
    if (!window.confirm(`${days} günden eski tüm verileri silmek istediğinize emin misiniz?`)) return;

    try {
      const response = await axios.delete(`${API}/data/cleanup?older_than_days=${days}`);
      alert(`Başarılı: ${response.data.deleted_count} kayıt silindi`);
      loadDashboardData();
    } catch (error) {
      alert("Veri temizleme hatası: " + (error.response?.data?.detail || error.message));
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", background: "#F8FAFF",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <RefreshCw size={22} color="#6366F1" style={{ animation: "spin 1s linear infinite" }} />
          <span style={{ color: "#64748B", fontSize: 16 }}>Yükleniyor…</span>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  /* ── shared styles ── */
  const card = {
    background: "#FFFFFF",
    border: "1px solid #E2E8F0",
    borderRadius: 16,
    overflow: "hidden",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFF" }}>

      {/* ── HEADER ── */}
      <header style={{
        background: "#FFFFFF",
        borderBottom: "1px solid #E2E8F0",
        padding: "0 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: 64,
      }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#0F172A", margin: 0 }}>
            UU AI Yönetim Paneli
          </h1>
          <p style={{ fontSize: 13, color: "#64748B", margin: 0 }}>
            Satış Sözlüğü Analytics ve Yönetim
          </p>
        </div>
        <button
          onClick={loadDashboardData}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "9px 18px",
            background: "linear-gradient(135deg, #6366F1, #3B82F6)",
            color: "white", border: "none", borderRadius: 10,
            fontSize: 14, fontWeight: 600, cursor: "pointer",
            boxShadow: "0 2px 8px rgba(99,102,241,0.3)",
          }}
        >
          <RefreshCw size={15} />
          Yenile
        </button>
      </header>

      {/* ── TAB NAV ── */}
      <nav style={{
        background: "#FFFFFF",
        borderBottom: "1px solid #E2E8F0",
        padding: "0 24px",
        display: "flex",
        overflowX: "auto",
      }}>
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: "flex", alignItems: "center", gap: 7,
                padding: "14px 16px",
                fontSize: 14, fontWeight: active ? 600 : 400,
                color: active ? "#4F46E5" : "#64748B",
                background: "none", border: "none", cursor: "pointer",
                borderBottom: active ? "2px solid #6366F1" : "2px solid transparent",
                whiteSpace: "nowrap", transition: "color 0.2s",
              }}
            >
              <tab.icon size={15} />
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* ── MAIN ── */}
      <main style={{ padding: "28px 24px", maxWidth: 1200, margin: "0 auto" }}>

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && dashboardStats && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
              <StatCard title="Toplam Arama"     value={dashboardStats.totalSearches}       icon={Search}   description="Tüm zamanlar"          color="blue"   />
              <StatCard title="Bugünkü Aramalar" value={dashboardStats.searchesToday}        icon={TrendingUp} description="Son 24 saat"         color="green"  />
              <StatCard title="Aktif Oturumlar"  value={dashboardStats.uniqueSessions}       icon={Users}    description="Benzersiz kullanıcılar" color="purple" />
              <StatCard title="Ortalama/Oturum"  value={dashboardStats.avgSearchesPerSession} icon={BarChart3} description="Arama sayısı"       color="orange" />
            </div>

            {/* Trends chart */}
            <div style={card}>
              <div style={{ padding: "20px 24px", borderBottom: "1px solid #F1F5F9" }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: "#0F172A", margin: 0 }}>7 Günlük Trend</h3>
              </div>
              <div style={{ padding: 24 }}>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 120 }}>
                  {trends.map((day, i) => {
                    const max = Math.max(...trends.map((d) => d.count), 1);
                    const h = Math.max((day.count / max) * 100, 6);
                    return (
                      <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: "#64748B" }}>{day.count}</span>
                        <div style={{
                          width: "100%",
                          height: `${h}%`,
                          borderRadius: "6px 6px 0 0",
                          background: day.count > 0
                            ? "linear-gradient(180deg, #6366F1, #3B82F6)"
                            : "#E2E8F0",
                          transition: "height 0.4s ease",
                        }} />
                        <span style={{ fontSize: 11, color: "#94A3B8", whiteSpace: "nowrap" }}>
                          {new Date(day.date).toLocaleDateString("tr-TR", { month: "short", day: "numeric" })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div style={card}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #F1F5F9" }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: "#0F172A", margin: 0 }}>Dil Dağılımı</h3>
            </div>
            <div style={{ padding: 24, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
              {Object.entries(languageDistribution).map(([lang, data]) => (
                <div key={lang} style={{
                  padding: "20px",
                  background: "#F8FAFF",
                  border: "1px solid #E2E8F0",
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}>
                  <div>
                    <div style={{ fontWeight: 600, color: "#0F172A", fontSize: 15 }}>
                      {lang === "tr" ? "Türkçe" : lang === "en" ? "İngilizce" : lang}
                    </div>
                    <div style={{ fontSize: 13, color: "#64748B", marginTop: 2 }}>{data.count} arama</div>
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: "#4F46E5" }}>{data.percentage}%</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Popular Questions Tab */}
        {activeTab === "questions" && (
          <div style={card}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #F1F5F9" }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: "#0F172A", margin: 0 }}>En Popüler Sorular</h3>
            </div>
            <div>
              {popularQuestions.map((q, i) => (
                <div key={i} style={{
                  padding: "16px 24px",
                  borderBottom: i < popularQuestions.length - 1 ? "1px solid #F1F5F9" : "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 16,
                  transition: "background 0.15s",
                }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#F8FAFF")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 500, color: "#0F172A", margin: "0 0 4px", fontSize: 15 }}>{q.question}</p>
                    <p style={{ fontSize: 12, color: "#94A3B8", margin: 0 }}>
                      Son sorulma: {new Date(q.lastAsked).toLocaleDateString("tr-TR")}
                      {" · "}
                      {q.language === "tr" ? "Türkçe" : "İngilizce"}
                    </p>
                  </div>
                  <div style={{ textAlign: "center", flexShrink: 0 }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: "#4F46E5" }}>{q.count}</div>
                    <div style={{ fontSize: 11, color: "#94A3B8" }}>kez soruldu</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sessions Tab */}
        {activeTab === "sessions" && (
          <div style={card}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #F1F5F9" }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: "#0F172A", margin: 0 }}>Son Oturum Aktiviteleri</h3>
            </div>
            <div>
              {sessionActivity.map((s, i) => (
                <div key={i} style={{
                  padding: "16px 24px",
                  borderBottom: i < sessionActivity.length - 1 ? "1px solid #F1F5F9" : "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 16,
                  transition: "background 0.15s",
                }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#F8FAFF")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 500, color: "#0F172A", margin: "0 0 4px", fontSize: 14, fontFamily: "monospace" }}>
                      {s.sessionId.substring(0, 20)}…
                    </p>
                    <p style={{ fontSize: 13, color: "#64748B", margin: "0 0 4px" }}>
                      {s.searchCount} arama · {Math.round(s.duration)} dakika süre
                    </p>
                    <p style={{ fontSize: 12, color: "#94A3B8", margin: 0 }}>
                      {s.sampleQuestions.slice(0, 2).join(", ")}
                    </p>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 12, color: "#94A3B8", marginBottom: 2 }}>Son aktivite</div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "#0F172A" }}>
                      {new Date(s.lastSearch).toLocaleString("tr-TR")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div style={card}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #F1F5F9" }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: "#0F172A", margin: 0 }}>Veri Yönetimi</h3>
            </div>
            <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
              {[30, 90].map((days) => (
                <div key={days} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "16px 20px",
                  border: "1px solid #E2E8F0",
                  borderRadius: 12, gap: 16,
                }}>
                  <div>
                    <h4 style={{ fontWeight: 600, color: "#0F172A", margin: "0 0 4px", fontSize: 15 }}>
                      Eski Verileri Temizle ({days} gün)
                    </h4>
                    <p style={{ fontSize: 13, color: "#64748B", margin: 0 }}>
                      {days} günden eski arama verilerini sil
                    </p>
                  </div>
                  <button
                    onClick={() => cleanupOldData(days)}
                    style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "9px 18px",
                      background: "#EF4444", color: "white",
                      border: "none", borderRadius: 10,
                      fontSize: 14, fontWeight: 600, cursor: "pointer",
                      flexShrink: 0, transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#DC2626")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "#EF4444")}
                  >
                    <Trash2 size={15} />
                    Temizle
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
