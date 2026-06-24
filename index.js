// Backrooms-Web Backend Pipeline
// スマホのフロントエンドから送られてくるSteam/Wineの命令を処理するコアスクリプト

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        
        // CORSヘッダーの設定（スマホブラウザからの通信ブロックを防ぐ絶対条件）
        const corsHeaders = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Content-Type": "application/json; charset=utf-8"
        };

        // プリフライト（OPTIONS）リクエストの自動承認
        if (request.method === "OPTIONS") {
            return new Response(null, { headers: corsHeaders });
        }

        // 1. SteamCMDのセッションコマンドを受付・解析するエンドポイント
        if (url.pathname === "/api/steam/command" && request.method === "POST") {
            try {
                const body = await request.json();
                const userCommand = body.command; // スマホから送られてきた文字列 (e.g. "login anonymous")

                // ここで本来はサーバー上のSteamCMDバイナリへコマンドをパイプします
                // スマホ側に返すためのリアルタイム応答シミュレーション
                let responseText = "";
                
                if (userCommand.includes("login")) {
                    responseText = "Logging in to Steam Public Server... OK\nWaiting for license confirmation... Success.";
                } else if (userCommand.includes("app_update")) {
                    responseText = "Checking for AppID 1705610 (Escape the Backrooms)...\nAllocating 4821 MB disk space...\nDownloading chunk 1/100... [1%]";
                } else {
                    responseText = `Command '${userCommand}' executed in active container stack.`;
                }

                return new Response(JSON.stringify({
                    status: "success",
                    stdout: responseText,
                    timestamp: new Date().toISOString()
                }), { headers: corsHeaders });

            } catch (err) {
                return new Response(JSON.stringify({ status: "error", message: err.message }), {
                    status: 500,
                    headers: corsHeaders
                });
            }
        }

        // 2. 将来ゲームのファイル（.exe等）をバラしてスマホにストリーミング配信するためのエンドポイント
        if (url.pathname === "/api/game/stream") {
            return new Response(JSON.stringify({
                message: "Game asset pipeline is ready. Awaiting SteamCMD deployment."
            }), { headers: corsHeaders });
        }

        // デフォルトの応答（どのAPIにも引っかからなかった場合）
        return new Response(JSON.stringify({
            system: "Backrooms Linux Kernel v5.15 Web Subsystem",
            status: "online"
        }), {
            status: 200,
            headers: corsHeaders
        });
    }
};
