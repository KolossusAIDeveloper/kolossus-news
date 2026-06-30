import React from 'react';
import NewsCard from './NewsCard';
import styles from './NewsFeed.module.css';

export default function NewsFeed({ articles, loading, error, onSelect, onRetry, search }) {
  if (loading) {
    return (
      <div className={styles.grid}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className={styles.skeleton}>
            <div className={styles.skeletonImg} />
            <div className={styles.skeletonBody}>
              <div className={styles.skeletonLine} style={{ width: '80%' }} />
              <div className={styles.skeletonLine} style={{ width: '60%' }} />
              <div className={styles.skeletonLine} style={{ width: '90%' }} />
              <div className={styles.skeletonLine} style={{ width: '70%' }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.center}>
        <div className={styles.errorBox}>
          <span className={styles.errorIcon}>⚠️</span>
          <p>Unable to load news at the moment.</p>
          <button className={styles.retryBtn} onClick={onRetry}>Try Again</button>
        </div>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className={styles.center}>
        <div className={styles.emptyBox}>
          <span className={styles.emptyIcon}>📰</span>
          <p>{search ? `No articles found for "${search}"` : 'No articles available'}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className={styles.count}>{articles.length} article{articles.length !== 1 ? 's' : ''}</p>
      <div className={styles.grid}>
        {articles.map(article => (
          <NewsCard key={article.id} article={article} onClick={() => onSelect(article)} />
        ))}
      </div>
    </div>
  );
}
