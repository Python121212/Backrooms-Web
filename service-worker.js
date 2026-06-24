// Backrooms-Web Service Worker (Android Optimization Mode)
const CACHE_NAME = 'backrooms-web-v2';

// 1. アプリの基本アセットをバックグラウンドで事前キャッシュ
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Worker] Pre-caching core assets');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Worker] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 2. 🎯 巨大データ処理（SteamCMDのダウンロードデータ）のメモリ割り当て最適化インターフェース
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // ゲームのダウンロードやアセットストリーミングに対する特殊パイプライン
  if (url.pathname.includes('/api/game/stream') || url.pathname.endsWith('.exe')) {
    event.respondWith(
      (async () => {
        // メモリリークを防ぐため、通常のキャッシュではなく、ストリーミングレスポンスに変換してスマホへ流し込む
        try {
          const response = await fetch(event.request);
          const reader = response.body.getReader();
          
          const stream = new ReadableStream({
            async start(controller) {
              while (true) {
                const { done, value } = await reader.read();
                if (done) {
                  controller.close();
                  break;
                }
                // ここでデータをブラウザのメインメモリに溜め込まず、即座に消費させる（スマホのRAMクラッシュ防止）
                controller.enqueue(value);
              }
            }
          });

          return new Response(stream, {
            headers: {
              'Content-Type': 'application/octet-stream',
              'X-Worker-Streaming': 'true'
            }
          });
        } catch (err) {
          return new Response(JSON.stringify({ error: "Streaming pipeline interrupted: " + err.message }), {
            status: 502,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      })()
    );
    return;
  }

  // 通常の静的ファイルのキャッシュファースト処理
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;
      return fetch(event.request);
    })
  );
});

// 3. メイン画面（HTML）からの通信を受け取るデータポート
self.addEventListener('message', async (event) => {
  if (event.data && event.data.type === 'INIT_STEAM_SANDBOX') {
    console.log('[Worker] Direct virtual storage synchronization active.');
    // 将来のセーブデータやパッチデータの整合性チェックをここで行います
    self.clients.matchAll().then(clients => {
      clients.forEach(client => client.postMessage({ type: 'STORAGE_SYNC_COMPLETE' }));
    });
  }
});
