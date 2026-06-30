import React, { useState } from 'react';
import styles from './NewsCard.module.css';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=220&fit=crop&q=80';

function formatDate(dateStr) {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now - d;
    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 60) return `${mins}m ago`;
    if (hrs < 24) return `${hrs}h ago`;
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

export default function NewsCard({ article, onClick }) {
  const [imgError, setImgError] = useState(false);
  const src = (!imgError && article.image) ? article.image : PLACEHOLDER;

  return (
    <article className={styles.card} onClick={onClick} role="button" tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick()}>
      <div className={styles.imgWrap}>
        <img
          src={src}
          alt={article.title}
          className={styles.img}
          onError={() => setImgError(true)}
          loading="lazy"
        />
        {!article.image && <span className={styles.noImgBadge}>📰</span>}
      </div>
      <div className={styles.body}>
        <div className={styles.meta}>
          <div className={styles.sources}>
            {(article.sources || [article.source]).map((s, i) => (
              <span key={i} className={styles.source}>{s}</span>
            ))}
          </div>
          <span className={styles.date}>{formatDate(article.pubDate)}</span>
        </div>
        <h2 className={styles.title}>{article.title}</h2>
        {article.description && (
          <p className={styles.desc}>{article.description}</p>
        )}
        <span className={styles.readMore}>Read more →</span>
      </div>
    </article>
  );
}
