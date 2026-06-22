/**
 * 请求缓存层（内存 + localStorage）
 *
 * 用于缓存 API 响应，减少重复请求：
 *   - 内存缓存（Map）：最快，页面刷新后清空
 *   - localStorage 缓存（可选）：持久化，跨页面/刷新保留
 *   - LRU 淘汰：达到上限时移除最久未使用的条目
 *   - TTL 支持：过期自动失效
 */

/* ==================================================================
   ── 内存缓存（LRU）──
   ================================================================== */
const DEFAULT_MAX = 100;
const cache = new Map();          // key → { value, ttl, timestamp, hits }
const accessOrder = [];           // 访问顺序记录（用于 LRU）

function touch(key) {
  const idx = accessOrder.indexOf(key);
  if (idx > -1) accessOrder.splice(idx, 1);
  accessOrder.push(key);
}

function evict(max) {
  while (accessOrder.length > max) {
    const oldest = accessOrder.shift();
    cache.delete(oldest);
  }
}

/* ==================================================================
   ── 公共 API ──
   ================================================================== */

/**
 * 从缓存读取
 *
 * @param {string} key — 缓存键
 * @returns {any|null}
 */
export function cacheGet(key) {
  const entry = cache.get(key);
  if (!entry) return null;

  // TTL 检查
  if (entry.ttl > 0 && Date.now() - entry.timestamp > entry.ttl) {
    cache.delete(key);
    const idx = accessOrder.indexOf(key);
    if (idx > -1) accessOrder.splice(idx, 1);
    return null;
  }

  entry.hits++;
  touch(key);
  return entry.value;
}

/**
 * 写入缓存
 *
 * @param {string} key
 * @param {any}    value
 * @param {object} [opts]
 * @param {number} [opts.ttl=60000]  — 过期时间（毫秒），默认 60s
 * @param {number} [opts.max=100]    — 最大条目数
 * @param {boolean} [opts.persist=false] — 是否持久化到 localStorage
 */
export function cacheSet(key, value, opts = {}) {
  const { ttl = 60000, max = DEFAULT_MAX, persist = false } = opts;

  cache.set(key, { value, ttl, timestamp: Date.now(), hits: 0 });
  touch(key);
  evict(max);

  if (persist) {
    try {
      const payload = JSON.stringify({ v: value, t: Date.now(), x: ttl });
      localStorage.setItem(`square_cache_${key}`, payload);
    } catch {}
  }
}

/**
 * 删除缓存
 */
export function cacheRemove(key) {
  cache.delete(key);
  const idx = accessOrder.indexOf(key);
  if (idx > -1) accessOrder.splice(idx, 1);
  try { localStorage.removeItem(`square_cache_${key}`); } catch {}
}

/**
 * 清空所有缓存
 */
export function cacheClear() {
  cache.clear();
  accessOrder.length = 0;
  // 清除所有 localStorage 缓存
  try {
    const toRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith('square_cache_')) toRemove.push(k);
    }
    toRemove.forEach(k => localStorage.removeItem(k));
  } catch {}
}

/**
 * 缓存统计信息
 */
export function cacheStats() {
  let totalHits = 0;
  let expired = 0;
  const now = Date.now();
  const entries = [];

  for (const [key, entry] of cache) {
    totalHits += entry.hits;
    const isExpired = entry.ttl > 0 && now - entry.timestamp > entry.ttl;
    if (isExpired) expired++;
    entries.push({
      key,
      hits: entry.hits,
      age: Math.round((now - entry.timestamp) / 1000),
      ttl: entry.ttl ? Math.round(entry.ttl / 1000) + 's' : '∞',
      expired: isExpired
    });
  }

  return {
    size: cache.size,
    max: DEFAULT_MAX,
    totalHits,
    expired,
    entries: entries.sort((a, b) => b.hits - a.hits)
  };
}
