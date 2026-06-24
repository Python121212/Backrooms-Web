export default {
  async fetch(request, env, ctx) {
    // WebTransportの接続要求（HTTP/3）のみを受け付ける
    if (request.headers.get('Upgrade') === 'webtransport') {
      const session = await request.acceptWebTransport();
      await session.ready;

      // Steam公式サーバーのポートへ生TCP接続を直結 (例: Steamロビー/認証サーバー群)
      // ※実際の宛先IP/PORTはSteamCMD起動時に動的に渡されますが、ここでは基本構造を定義
      const socket = await connect({ hostname: "cm1-gbr.steampowered.com", port: 27015 });

      // スマホからの上りデータをSteamへ、Steamからの下りデータをスマホへ直列パススルー
      ctx.waitUntil(Promise.all([
        session.incomingBidirectionalStreams.getReader().read().then(({value}) => value.readable.pipeTo(socket.writable)),
        socket.readable.pipeTo(session.createBidirectionalStream())
      ]));

      return new Response(null, { status: 101 });
    }
    return new Response("Not a WebTransport Request", { status: 400 });
  }
};
