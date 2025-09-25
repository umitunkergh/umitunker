import React, { useState } from "react";
import { Search, BookOpen, TrendingUp, Users, Target, BarChart3 } from "lucide-react";
import { mockData } from "../data/mock";

const HomePage = () => {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);

  const handleSearch = async (searchQuery = query) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Find mock answer
    const mockAnswer = mockData.find(item => 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      searchQuery.toLowerCase().includes(item.question.toLowerCase())
    );
    
    const result = mockAnswer || {
      question: searchQuery,
      answer: `"${searchQuery}" hakkında detaylı bilgi burada görünecek. AI sistemimiz satış terminolojisi, stratejiler ve örneklerle size kapsamlı yanıtlar sunacak.`,
      examples: [
        "Örnek senaryo ve açıklama burada yer alacak",
        "Pratik uygulama örnekleri gösterilecek"
      ],
      relatedTerms: ["İlgili terim 1", "İlgili terim 2"]
    };

    setAnswer(result);
    setLoading(false);
    
    // Add to recent searches
    if (!recentSearches.includes(searchQuery)) {
      setRecentSearches(prev => [searchQuery, ...prev.slice(0, 4)]);
    }
  };

  const handleQuickSearch = (term) => {
    setQuery(term);
    handleSearch(term);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 py-4">
        <div className="container">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-medium text-gray-900">UU AI</h1>
                <p className="text-sm text-gray-600">Ümit ÜNKER Satış Sözlüğü</p>
              </div>
            </div>
            <nav className="flex space-x-6">
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Ana Sayfa</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Hakkında</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">İletişim</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-20 text-center">
          <div className="container-narrow">
            <div className="animate-slide-up">
              <h1 className="display-hero mb-6">
                Satış Dünyasında Her Sorunun<br />
                <span className="text-blue-600">AI Destekli Yanıtı</span>
              </h1>
              <p className="body-large mb-12 text-gray-600">
                Satış terminolojisinden stratejilere, KPI'lardan müşteri yönetimine kadar 
                her konuda hızlı ve örnekli açıklamalar alın.
              </p>
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

            {/* Quick Search Suggestions */}
            <div className="mt-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <p className="body-small mb-4 text-gray-500">Popüler aramalar:</p>
              <div className="flex flex-wrap justify-center gap-3">
                {["KPI Nedir", "Lead Generation", "Sales Funnel", "CRM Stratejisi", "Cross Selling"].map((term, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickSearch(term)}
                    className="btn-secondary text-sm"
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
                <div className="body-standard mb-6 text-gray-700 leading-relaxed">
                  {answer.answer}
                </div>
                
                {answer.examples && answer.examples.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-medium text-gray-900 mb-3">📚 Örnekler:</h3>
                    <ul className="space-y-2">
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
                <h3 className="heading-medium mb-3">Türkçe Destek</h3>
                <p className="body-standard text-gray-600">
                  Türkiye pazarına özel örnekler ve açıklamalar
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
                <p className="body-standard text-gray-600">info@uuai.com.tr</p>
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