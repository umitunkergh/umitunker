import React, { useState, useEffect } from "react";
import { 
  BarChart3, Users, Search, TrendingUp, Globe, Calendar,
  Trash2, RefreshCw, Eye, Clock
} from "lucide-react";
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api/admin`;

const AdminDashboard = () => {
  const [dashboardStats, setDashboardStats] = useState(null);
  const [trends, setTrends] = useState([]);
  const [popularQuestions, setPopularQuestions] = useState([]);
  const [languageDistribution, setLanguageDistribution] = useState({});
  const [sessionActivity, setSessionActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

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
        axios.get(`${API}/sessions/activity?limit=30`)
      ]);

      setDashboardStats(statsRes.data);
      setTrends(trendsRes.data.trends);
      setPopularQuestions(popularRes.data.popular_questions);
      setLanguageDistribution(langRes.data.language_distribution);
      setSessionActivity(sessionsRes.data.session_activity);
    } catch (error) {
      console.error('Admin data loading error:', error);
    } finally {
      setLoading(false);
    }
  };

  const cleanupOldData = async (days) => {
    if (!window.confirm(`${days} günden eski tüm verileri silmek istediğinize emin misiniz?`)) {
      return;
    }

    try {
      const response = await axios.delete(`${API}/data/cleanup?older_than_days=${days}`);
      alert(`Başarılı: ${response.data.deleted_count} kayıt silindi`);
      loadDashboardData();
    } catch (error) {
      alert('Veri temizleme hatası: ' + (error.response?.data?.detail || error.message));
    }
  };

  const StatCard = ({ title, value, icon: Icon, description, color = "blue" }) => (
    <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-3xl font-bold text-${color}-600`}>{value}</p>
          {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
        </div>
        <Icon className={`w-12 h-12 text-${color}-600 opacity-60`} />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Yükleniyor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">UU AI Yönetim Paneli</h1>
            <p className="text-gray-600">Satış Sözlüğü Analytics ve Yönetim</p>
          </div>
          <button
            onClick={loadDashboardData}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Yenile</span>
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200 px-6">
        <div className="flex space-x-8">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp },
            { id: 'questions', label: 'Popüler Sorular', icon: Search },
            { id: 'sessions', label: 'Oturumlar', icon: Users },
            { id: 'settings', label: 'Ayarlar', icon: Globe }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-4 px-2 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <main className="p-6">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && dashboardStats && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Toplam Arama"
                value={dashboardStats.totalSearches}
                icon={Search}
                description="Tüm zamanlar"
                color="blue"
              />
              <StatCard
                title="Bugünkü Aramalar"
                value={dashboardStats.searchesToday}
                icon={TrendingUp}
                description="Son 24 saat"
                color="green"
              />
              <StatCard
                title="Aktif Oturumlar"
                value={dashboardStats.uniqueSessions}
                icon={Users}
                description="Benzersiz kullanıcılar"
                color="purple"
              />
              <StatCard
                title="Ortalama/Oturum"
                value={dashboardStats.avgSearchesPerSession}
                icon={BarChart3}
                description="Arama sayısı"
                color="orange"
              />
            </div>

            {/* Trends Chart */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">7 Günlük Trend</h3>
              <div className="grid grid-cols-7 gap-2">
                {trends.map((day, index) => (
                  <div key={index} className="text-center">
                    <div className="text-xs text-gray-500 mb-2">
                      {new Date(day.date).toLocaleDateString('tr-TR', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                    <div 
                      className="bg-blue-100 rounded-t"
                      style={{ 
                        height: `${Math.max(day.count * 4, 10)}px`,
                        backgroundColor: day.count > 0 ? '#3B82F6' : '#E5E7EB'
                      }}
                    ></div>
                    <div className="text-sm font-medium mt-1">{day.count}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Dil Dağılımı</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(languageDistribution).map(([lang, data]) => (
                  <div key={lang} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium">{lang === 'tr' ? 'Türkçe' : lang === 'en' ? 'İngilizce' : lang}</span>
                      <div className="text-sm text-gray-500">{data.count} arama</div>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">{data.percentage}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Popular Questions Tab */}
        {activeTab === 'questions' && (
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold">En Popüler Sorular</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {popularQuestions.map((question, index) => (
                <div key={index} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{question.question}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Son sorulma: {new Date(question.lastAsked).toLocaleDateString('tr-TR')}
                        {' • '}
                        {question.language === 'tr' ? 'Türkçe' : 'İngilizce'}
                      </p>
                    </div>
                    <div className="text-center ml-4">
                      <div className="text-2xl font-bold text-blue-600">{question.count}</div>
                      <div className="text-xs text-gray-500">kez soruldu</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sessions Tab */}
        {activeTab === 'sessions' && (
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Son Oturum Aktiviteleri</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {sessionActivity.map((session, index) => (
                <div key={index} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Oturum: {session.sessionId.substring(0, 20)}...</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {session.searchCount} arama • {Math.round(session.duration)} dakika süre
                      </p>
                      <div className="text-xs text-gray-400 mt-2">
                        Örnek sorular: {session.sampleQuestions.slice(0, 2).join(', ')}
                      </div>
                    </div>
                    <div className="text-center ml-4">
                      <div className="text-sm text-gray-500">Son aktivite</div>
                      <div className="text-sm font-medium">
                        {new Date(session.lastSearch).toLocaleString('tr-TR')}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Veri Yönetimi</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium">Eski Verileri Temizle (30 gün)</h4>
                    <p className="text-sm text-gray-500">30 günden eski arama verilerini sil</p>
                  </div>
                  <button
                    onClick={() => cleanupOldData(30)}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Temizle</span>
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium">Eski Verileri Temizle (90 gün)</h4>
                    <p className="text-sm text-gray-500">90 günden eski arama verilerini sil</p>
                  </div>
                  <button
                    onClick={() => cleanupOldData(90)}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Temizle</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;