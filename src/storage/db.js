/**
 * IndexedDB Promise 封装
 *
 * 用于存储较大数据（离线帖子队列、图片 Blob、API 响应快照）
 *
 * 数据库名：square_db
 * 对象仓库：
 *   offline_posts  — 离线待发帖子（keyPath: id）
 *   blob_cache     — 图片/音频 Blob（keyPath: key）
 *   api_snapshots  — API 响应快照（keyPath: key）
 */

const DB_NAME = 'square_db';
const DB_VERSION = 1;
const STORES = {
  offline: 'offline_posts',
  blobs: 'blob_cache',
  snapshots: 'api_snapshots'
};

let dbPromise = null;

function openDB() {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      dbPromise = null;
      reject(new Error('浏览器不支持 IndexedDB'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORES.offline)) {
        db.createObjectStore(STORES.offline, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.blobs)) {
        db.createObjectStore(STORES.blobs, { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains(STORES.snapshots)) {
        db.createObjectStore(STORES.snapshots, { keyPath: 'key' });
      }
    };

    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = () => { dbPromise = null; reject(request.error); };
    request.onblocked = () => console.warn('[IDB] 数据库升级被阻塞，请关闭其他标签页');
  });

  return dbPromise;
}

function promisify(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/* ==================================================================
   ── 通用 CRUD ──
   ================================================================== */

async function get(storeName, key) {
  const db = await openDB();
  const tx = db.transaction(storeName, 'readonly');
  return promisify(tx.objectStore(storeName).get(key));
}

async function put(storeName, value, key) {
  const db = await openDB();
  const tx = db.transaction(storeName, 'readwrite');
  const item = key ? { ...value, key } : value;
  return promisify(tx.objectStore(storeName).put(item));
}

async function remove(storeName, key) {
  const db = await openDB();
  const tx = db.transaction(storeName, 'readwrite');
  return promisify(tx.objectStore(storeName).delete(key));
}

async function getAll(storeName) {
  const db = await openDB();
  const tx = db.transaction(storeName, 'readonly');
  return promisify(tx.objectStore(storeName).getAll());
}

async function clearStore(storeName) {
  const db = await openDB();
  const tx = db.transaction(storeName, 'readwrite');
  return promisify(tx.objectStore(storeName).clear());
}

/* ==================================================================
   ── 离线帖子队列 ──
   ================================================================== */

export const offlinePosts = {
  async add(post) {
    const item = { ...post, id: post.id || 'off_' + Date.now(), created: Date.now() };
    await put(STORES.offline, item);
    return item.id;
  },

  async getAll() {
    return getAll(STORES.offline);
  },

  async remove(id) {
    return remove(STORES.offline, id);
  },

  async clear() {
    return clearStore(STORES.offline);
  },

  async count() {
    return (await getAll(STORES.offline)).length;
  }
};

/* ==================================================================
   ── Blob 缓存（图片/音频）──
   ================================================================== */

export const blobCache = {
  async set(key, blob) {
    return put(STORES.blobs, { key, blob, created: Date.now() }, key);
  },

  async get(key) {
    const result = await get(STORES.blobs, key);
    return result?.blob || null;
  },

  async remove(key) {
    return remove(STORES.blobs, key);
  },

  async clear() {
    return clearStore(STORES.blobs);
  },

  async keys() {
    const all = await getAll(STORES.blobs);
    return all.map(e => e.key);
  }
};

/* ==================================================================
   ── API 响应快照 ──
   ================================================================== */

export const apiSnapshots = {
  async set(key, data, ttl = 300000) {
    return put(STORES.snapshots, { key, data, expires: Date.now() + ttl }, key);
  },

  async get(key) {
    const result = await get(STORES.snapshots, key);
    if (!result) return null;
    if (Date.now() > result.expires) {
      await remove(STORES.snapshots, key);
      return null;
    }
    return result.data;
  },

  async remove(key) {
    return remove(STORES.snapshots, key);
  },

  async clear() {
    return clearStore(STORES.snapshots);
  }
};

/* ==================================================================
   ── 整体状态 ──
   ================================================================== */

export async function getDBStats() {
  const [offline, blobs, snapshots] = await Promise.all([
    offlinePosts.getAll(),
    blobCache.keys(),
    getAll(STORES.snapshots)
  ]);
  return {
    offlinePosts: offline.length,
    cachedBlobs: blobs.length,
    apiSnapshots: snapshots.length
  };
}

export async function closeDB() {
  if (dbPromise) {
    const db = await dbPromise;
    db.close();
    dbPromise = null;
  }
}
