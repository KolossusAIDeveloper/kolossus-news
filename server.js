const express = require('express');
const Parser = require('rss-parser');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const parser = new Parser({
  timeout: 15000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; KolossusNews/1.0)',
    'Accept': 'application/rss+xml, application/xml, text/xml, */*',
  },
  customFields: {
    item: [
      ['media:content', 'mediaContent'],
      ['media:thumbnail', 'mediaThumbnail'],
      ['content:encoded', 'contentEncoded'],
    ],
  },
});

const RSS_FEEDS = {
  technology: [
    { url: 'https://feeds.feedburner.com/TechCrunch', name: 'TechCrunch' },
    { url: 'https://www.theverge.com/rss/index.xml', name: 'The Verge' },
    { url: 'https://feeds.arstechnica.com/arstechnica/index', name: 'Ars Technica' },
    { url: 'https://www.wired.com/feed/rss', name: 'WIRED' },
  ],
  world: [
    { url: 'https://feeds.bbci.co.uk/news/world/rss.xml', name: 'BBC News' },
    { url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', name: 'NYT World' },
    { url: 'https://feeds.skynews.com/feeds/rss/world.xml', name: 'Sky News' },
    { url: 'https://www.aljazeera.com/xml/rss/all.xml', name: 'Al Jazeera' },
  ],
  science: [
    { url: 'https://www.nasa.gov/rss/dyn/breaking_news.rss', name: 'NASA' },
    { url: 'https://feeds.feedburner.com/sciencedaily/top_news', name: 'Science Daily' },
    { url: 'https://www.sciencenews.org/feed', name: 'Science News' },
    { url: 'https://phys.org/rss-feed/', name: 'Phys.org' },
  ],
};

function extractImage(item) {
  if (item.enclosure && item.enclosure.url) {
    const url = item.enclosure.url;
    if (/\.(jpg|jpeg|png|gif|webp)/i.test(url)) return url;
  }
  if (item.mediaContent) {
    const mc = Array.isArray(item.mediaContent) ? item.mediaContent[0] : item.mediaContent;
    if (mc && mc.$ && mc.$.url) return mc.$.url;
  }
  if (item.mediaThumbnail) {
    const mt = Array.isArray(item.mediaThumbnail) ? item.mediaThumbnail[0] : item.mediaThumbnail;
    if (mt && mt.$ && mt.$.url) return mt.$.url;
  }
  const content = item.contentEncoded || item.content || item.summary || '';
  const match = content.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (match && match[1]) return match[1];
  return null;
}

function cleanDescription(text) {
  if (!text) return '';
  return text
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 300);
}

function titleSimilarity(a, b) {
  const wordsA = new Set(a.toLowerCase().split(/\W+/).filter(w => w.length > 4));
  const wordsB = new Set(b.toLowerCase().split(/\W+/).filter(w => w.length > 4));
  if (wordsA.size === 0 || wordsB.size === 0) return 0;
  let common = 0;
  for (const w of wordsA) if (wordsB.has(w)) common++;
  return common / Math.max(wordsA.size, wordsB.size);
}

function deduplicateArticles(articles) {
  const groups = [];
  for (const article of articles) {
    let merged = false;
    for (const group of groups) {
      if (titleSimilarity(article.title, group.title) > 0.45) {
        if (!group.sources.includes(article.source)) {
          group.sources.push(article.source);
        }
        if (!group.image && article.image) group.image = article.image;
        merged = true;
        break;
      }
    }
    if (!merged) {
      groups.push({ ...article, sources: [article.source] });
    }
  }
  return groups;
}

app.get('/api/news', async (req, res) => {
  const { category = 'all' } = req.query;

  let feedsToFetch = [];
  if (category === 'all') {
    Object.values(RSS_FEEDS).forEach(feeds => feedsToFetch.push(...feeds));
  } else if (RSS_FEEDS[category]) {
    feedsToFetch = RSS_FEEDS[category];
  }

  const allArticles = [];

  await Promise.allSettled(
    feedsToFetch.map(async (feed) => {
      try {
        const result = await parser.parseURL(feed.url);
        const items = result.items.slice(0, 15).map(item => ({
          id: item.guid || item.link || item.title || Math.random().toString(),
          title: (item.title || 'Untitled').trim(),
          description: cleanDescription(item.contentSnippet || item.summary || item.content || ''),
          link: item.link || '',
          pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
          source: feed.name,
          image: extractImage(item),
        }));
        allArticles.push(...items);
      } catch (err) {
        console.error(`[RSS] Failed to fetch ${feed.name}: ${err.message}`);
      }
    })
  );

  allArticles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
  const deduplicated = deduplicateArticles(allArticles);

  res.json({ articles: deduplicated, timestamp: new Date().toISOString() });
});

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use(express.static(path.join(__dirname, 'client/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build/index.html'));
});

const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, () => console.log(`Kolossus News server running on port ${PORT}`));
}

module.exports = app;
