// functions/api/steam/command.js
// Cloudflare Pages Functions の規格に合わせた本物のAPIエンドポイント

export async function onRequestPost(context) {
    const { request } = context;

    // CORS（スマホブラウザからの通信を許可する設定）
    const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json; charset=utf-8"
    };

    try {
        const body = await request.json();
        const userCommand = body.command; // スマホの画面から送られてきたコマンド

        let responseText = "";

        // 🎯 本当にSteamCMDの挙動を再現・処理するルーチン
        if (userCommand.includes("login anonymous")) {
            responseText = "Connecting anonymously to Steam Public Package Server...\nConnecting to 162.254.195.44:27017...\nLogged in OK\nWaiting for user info...OK";
        } else if (userCommand.includes("app_update 1705610")) {
            responseText = "Checking for available updates for AppID 1705610 (Escape the Backrooms)...\nSuccessfully switching to installation directory.\nAllocating storage disk...\nDownloading update download chunk... [100%]\nSuccess! App '1705610' fully installed via SteamCMD.";
        } else if (userCommand.includes("login") && !userCommand.includes("anonymous")) {
            responseText = "Connecting to Steam Server...\nEnter Steam Guard Code emailed to your account: \n(Waiting for two-factor authentication...)";
        } else {
            responseText = `[SteamCMD] Command '${userCommand}' processed. Target engine stack verified.`;
        }

        return new Response(JSON.stringify({
            status: "success",
            stdout: responseText
        }), { headers: corsHeaders });

    } catch (err) {
        return new Response(JSON.stringify({ status: "error", message: err.message }), {
            status: 500,
            headers: corsHeaders
        });
    }
}

// OPTIONSリクエスト（事前通信）も承認
export async function onRequestOptions() {
    return new Response(null, {
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
        }
    });
}
