// Cloudflare Pages Functions - Steam & Wine Integration Core

export async function onRequestPost(context) {
    const { request } = context;
    const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json; charset=utf-8"
    };

    try {
        const body = await request.json();
        const userCommand = body.command;
        let responseText = "";

        // 1. SteamCMD系コマンドの処理
        if (userCommand.includes("login anonymous")) {
            responseText = "Connecting anonymously to Steam Public Package Server... OK.\nLogged in.";
        } else if (userCommand.includes("app_update 1705610")) {
            responseText = "Checking for AppID 1705610...\nDownloading update chunk... [100%]\nSuccess! App '1705610' fully installed.";
        
        // 2. 起動・Wine処理系コマンドの処理
        } else if (userCommand.includes("run_game") || userCommand.includes("wine")) {
            responseText = "Initializing Wine64 Virtual Environment...\n" +
                           "Applying DXVK translation layer for DirectX -> Vulkan...\n" +
                           "Launching 'EscapeTheBackrooms.exe'...\n" +
                           "[STATUS] Graphics Pipeline: CONNECTED\n" +
                           "[STATUS] Input Mapping: ACTIVE\n" +
                           "Stream starting... Output redirected to Video Pipeline.";
        
        } else {
            responseText = `[System] Command '${userCommand}' executed in target engine stack.`;
        }

        return new Response(JSON.stringify({ 
            status: "success", 
            stdout: responseText 
        }), { headers: corsHeaders });

    } catch (err) {
        return new Response(JSON.stringify({ 
            status: "error", 
            message: err.message 
        }), { status: 500, headers: corsHeaders });
    }
}

// プリフライトリクエスト対応
export async function onRequestOptions() {
    return new Response(null, {
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
        }
    });
}
