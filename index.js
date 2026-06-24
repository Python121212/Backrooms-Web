export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // スマホからのCORSブロックを回避するヘッダー設定
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // /steamcmd エンドポイントにアクセスされたら本物のValveサーバーからデータを取得して返す
    if (url.pathname === "/steamcmd") {
      const steamCmdUrl = "https://steamcdn-a.akamaihd.net/client/installer/steamcmd_linux.tar.gz";
      
      try {
        const steamResponse = await fetch(steamCmdUrl);
        
        // バイナリデータをそのままスマホのフロント（OPFS）へストリーミング転送
        return new Response(steamResponse.body, {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/gzip",
          }
        });
      } catch (err) {
        return new Response(`SteamCMD Fetch Error: ${err.message}`, { status: 500, headers: corsHeaders });
      }
    }

    return new Response("Backrooms Web Proxy Backend Engine Ready.", {
      headers: { "Content-Type": "text/plain", ...corsHeaders },
    });
  },
};
