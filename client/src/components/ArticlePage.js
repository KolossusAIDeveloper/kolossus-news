import React, { useState } from 'react';
import styles from './ArticlePage.module.css';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=400&fit=crop&q=80';

function formatFullDate(dateStr) {
  try {
    return new Date(dateStr).toLocaleDateString(undefined, {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  } catch {
    return dateStr;
  }
}

export default function ArticlePage({ article, onBack }) {
  const [imgError, setImgError] = useState(false);
  const src = (!imgError && article.image) ? article.image : PLACEHOLDER;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <button className={styles.backBtn} onClick={onBack}>
            ← Back to Feed
          </button>
          <div className={styles.logo}>
            <span>⚡</span>
            <span>Kolossus <strong>News</strong></span>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <article className={styles.article}>
          <div className={styles.articleMeta}>
            <div className={styles.sources}>
              {(article.sources || [article.source]).map((s, i) => (
                <span key={i} className={styles.source}>{s}</span>
              ))}
            </div>
            <time className={styles.date}>{formatFullDate(article.pubDate)}</time>
          </div>

          <h1 className={styles.title}>{article.title}</h1>

          <div className={styles.imgWrap}>
            <img
              src={src}
              alt={article.title}
              className={styles.img}
              onError={() => setImgError(true)}
            />
          </div>

          {article.description && (
            <p className={styles.description}>{article.description}</p>
          )}

          <div className={styles.divider} />

          <div className={styles.actionBox}>
            <p className={styles.actionText}>
              Read the full story on the original source:
            </p>
            <div className={styles.actionBtns}>
              <a
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.readFullBtn}
              >
                Open Full Article ↗
              </a>
              <button className={styles.backBtnSecondary} onClick={onBack}>
                ← Back to Feed
              </button>
            </div>
          </div>
        </article>
      </main>

      <footer className={styles.footer}>
        <p>© 2024 Kolossus News · Auto-refreshes every 60 seconds</p>
      </footer>
    </div>
  );
}
