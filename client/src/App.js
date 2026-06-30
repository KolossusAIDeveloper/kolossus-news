import React, { useState, useEffect, useCallback } from 'react';
import NewsFeed from './components/NewsFeed';
import ArticlePage from './components/ArticlePage';
import styles from './App.module.css';

const CATEGORIES = [
  { id: 'all', label: 'All News' },
  { id: 'technology', label: 'Technology' },
  { id: 'world', label: 'World' },
  { id: 'science', label: 'Science' },
];

const REFRESH_INTERVAL = 60000;

export default function App() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNews = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/news?category=${category}`);
      if (!res.ok) throw new Error('Failed to fetch news');
      const data = await res.json();
      setArticles(data.articles || []);
      setLastUpdated(new Date(data.timestamp));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [category]);

  useEffect(() => {
    setSelectedArticle(null);
    fetchNews();
  }, [category, fetchNews]);

  useEffect(() => {
    const interval = setInterval(() => fetchNews(true), REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchNews]);

  const filtered = articles.filter(a => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      a.title?.toLowerCase().includes(q) ||
      a.description?.toLowerCase().includes(q) ||
      a.sources?.some(s => s.toLowerCase().includes(q))
    );
  });

  if (selectedArticle) {
    return <ArticlePage article={selectedArticle} onBack={() => setSelectedArticle(null)} />;
  }

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>⚡</span>
            <span className={styles.logoText}>Kolossus <strong>News</strong></span>
          </div>
          {lastUpdated && (
            <div className={styles.lastUpdated}>
              {refreshing && <span className={styles.refreshDot} />}
              Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
        </div>
      </header>

      <div className={styles.controls}>
        <div className={styles.controlsInner}>
          <nav className={styles.tabs}>
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                className={`${styles.tab} ${category === cat.id ? styles.tabActive : ''}`}
                onClick={() => setCategory(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </nav>
          <div className={styles.searchWrap}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Search articles..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className={styles.clearSearch} onClick={() => setSearch('')}>✕</button>
            )}
          </div>
        </div>
      </div>

      <main className={styles.main}>
        <NewsFeed
          articles={filtered}
          loading={loading}
          error={error}
          onSelect={setSelectedArticle}
          onRetry={() => fetchNews()}
          search={search}
        />
      </main>

      <footer className={styles.footer}>
        <p>© 2024 Kolossus News · Auto-refreshes every 60 seconds</p>
      </footer>
    </div>
  );
}
