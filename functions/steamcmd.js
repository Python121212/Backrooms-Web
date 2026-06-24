export async function onRequest(context) {
  const steamCmdUrl = "https://steamcdn-a.akamaihd.net/client/installer/steamcmd_linux.tar.gz";
  
  try {
    // Valve公式サーバーからSteamCMDのバイナリを取得
    const steamResponse = await fetch(steamCmdUrl);
    
    // Pagesの機能を使って、スマホ側へそのままストリーミング転送
    return new Response(steamResponse.body, {
      status: 200,
      headers: {
        "Content-Type": "application/gzip",
        "Access-Control-Allow-Origin": "*",
      }
    });
  } catch (err) {
    return new Response(`SteamCMD Fetch Error: ${err.message}`, { status: 500 });
  }
}
