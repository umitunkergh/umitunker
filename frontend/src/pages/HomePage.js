import React, { useState, useEffect } from "react";
import { Search, BookOpen, TrendingUp, Users, Target, BarChart3 } from "lucide-react";
import { searchAPI, getRecentSearches } from "../services/api";

const HomePage = () => {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [error, setError] = useState(null);

  // Load recent searches on component mount
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
      
      // Add to recent searches if not already present
      if (!recentSearches.includes(searchQuery)) {
        setRecentSearches(prev => [searchQuery, ...prev.slice(0, 4)]);
      }
    } catch (err) {
      setError(err.message);
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSearch = (term) => {
    setQuery(term);
    handleSearch(term);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Simple Google-like */}
      <header className="py-6">
        <div className="container text-center">
          <div className="flex items-center justify-center space-x-3 mb-2">
            <BookOpen className="w-10 h-10 text-blue-600" />
            <div>
              <h1 className="text-2xl font-normal text-gray-900">UU AI</h1>
            </div>
          </div>
          <p className="text-sm text-gray-600">Ümit ÜNKER Satış Sözlüğü</p>
        </div>
      </header>

      {/* Hero Section - Google Style */}
      <main className="flex-1">
        <section className="py-16 text-center">
          <div className="container-narrow">
            <div className="animate-slide-up">
              <h1 className="display-hero mb-8">
                Satış Dünyasında Her Sorunun<br />
                <span className="text-blue-600">AI Destekli Yanıtı</span>
              </h1>
            </div>

            {/* Search Box */}
            <div className="search-container animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <input
                type="text"
                className="search-input"
                placeholder="Satış ile ilgili sorunuzu yazın... (örn: KPI nedir?)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                disabled={loading}
              />
              <button 
                className="search-button"
                onClick={() => handleSearch()}
                disabled={loading}
              >
                {loading ? (
                  <div className="loading-dots">
                    <div className="loading-dot"></div>
                    <div className="loading-dot"></div>
                    <div className="loading-dot"></div>
                  </div>
                ) : (
                  <Search className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg animate-slide-up">
                <p className="text-red-700">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="mt-2 text-sm text-red-600 hover:text-red-800"
                >
                  Kapat
                </button>
              </div>
            )}

            {/* Quick Search Suggestions */}
            <div className="mt-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <p className="body-small mb-4 text-gray-500">Popüler aramalar:</p>
              <div className="flex flex-wrap justify-center gap-3">
                {["KPI Nedir", "Lead Generation", "Sales Funnel", "CRM Stratejisi", "Cross Selling"].map((term, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickSearch(term)}
                    className="btn-secondary text-sm"
                    disabled={loading}
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Answer Section */}
        {answer && (
          <section className="py-12 bg-gray-50">
            <div className="container-narrow">
              <div className="answer-card animate-slide-up">
                <h2 className="heading-medium mb-4 text-gray-900">{answer.question}</h2>
                <div className="body-standard mb-6 text-gray-700 leading-relaxed whitespace-pre-line">
                  {answer.answer}
                </div>
                
                {answer.examples && answer.examples.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-medium text-gray-900 mb-3">📚 Örnekler:</h3>
                    <ul className="space-y-3">
                      {answer.examples.map((example, index) => (
                        <li key={index} className="body-standard text-gray-600 pl-4 border-l-2 border-blue-200">
                          {example}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {answer.relatedTerms && answer.relatedTerms.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">🔗 İlgili Konular:</h3>
                    <div className="flex flex-wrap gap-2">
                      {answer.relatedTerms.map((term, index) => (
                        <button
                          key={index}
                          onClick={() => handleQuickSearch(term)}
                          className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm hover:bg-blue-100 transition-colors"
                          disabled={loading}
                        >
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

        {/* Features Section */}
        <section className="py-20">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="heading-large mb-4">Neden UU AI Satış Sözlüğü?</h2>
              <p className="body-large text-gray-600">Satış dünyasında başarılı olmak için ihtiyacınız olan her bilgi</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="text-center p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-all">
                <TrendingUp className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="heading-medium mb-3">Hızlı Yanıtlar</h3>
                <p className="body-standard text-gray-600">
                  Saniyeler içinde detaylı ve örnekli açıklamalar alın
                </p>
              </div>

              <div className="text-center p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-all">
                <Target className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="heading-medium mb-3">Örnekli Açıklamalar</h3>
                <p className="body-standard text-gray-600">
                  Her terim gerçek satış senaryolarıyla desteklenir
                </p>
              </div>

              <div className="text-center p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-all">
                <BarChart3 className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="heading-medium mb-3">Güncel İçerik</h3>
                <p className="body-standard text-gray-600">
                  Modern satış teknikleri ve stratejileriyle güncel kalın
                </p>
              </div>

              <div className="text-center p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-all">
                <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="heading-medium mb-3">Çok Dilli Destek</h3>
                <p className="body-standard text-gray-600">
                  Hangi dilde sorarsaniz, o dilde cevap alın
                </p>
              </div>

              <div className="text-center p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-all">
                <BookOpen className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="heading-medium mb-3">Kapsamlı Sözlük</h3>
                <p className="body-standard text-gray-600">
                  Satışın A'sından Z'sine tüm terimleri kapsayan rehber
                </p>
              </div>

              <div className="text-center p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-all">
                <Search className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="heading-medium mb-3">Akıllı Arama</h3>
                <p className="body-standard text-gray-600">
                  AI destekli arama ile en ilgili sonuçları bulun
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <section className="py-12 bg-gray-50">
            <div className="container-narrow">
              <h3 className="heading-medium mb-6 text-center">Son Aramalarınız</h3>
              <div className="flex flex-wrap justify-center gap-3">
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickSearch(search)}
                    className="btn-secondary text-sm"
                    disabled={loading}
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12 bg-gray-50">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <BookOpen className="w-6 h-6 text-blue-600" />
                <span className="font-medium text-gray-900">UU AI Satış Sözlüğü</span>
              </div>
              <p className="body-standard text-gray-600">
                Ümit ÜNKER tarafından geliştirilen AI destekli satış terminolojisi platformu.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Popüler Konular</h4>
              <ul className="space-y-2">
                <li><a href="#" className="body-standard text-gray-600 hover:text-blue-600 transition-colors">Satış KPI'ları</a></li>
                <li><a href="#" className="body-standard text-gray-600 hover:text-blue-600 transition-colors">Lead Generation</a></li>
                <li><a href="#" className="body-standard text-gray-600 hover:text-blue-600 transition-colors">CRM Stratejileri</a></li>
                <li><a href="#" className="body-standard text-gray-600 hover:text-blue-600 transition-colors">Sales Funnel</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-4">İletişim</h4>
              <div className="space-y-2">
                <p className="body-standard text-gray-600">info@umitunker.com</p>
                <p className="body-standard text-gray-600">www.umitunker.com</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 mt-8 pt-8 text-center">
            <p className="body-small text-gray-500">
              © 2025 UU AI Satış Sözlüğü. Tüm hakları saklıdır.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;