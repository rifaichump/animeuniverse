export default function handler(req, res) {
    let ip = "animeunicraft.servegame.com"
    let port = "19165"
    let url = `minecraft://?addExternalServer=AnimeUnicraft|${ip}:${port}`
    
    res.setHeader("Content-Type", "text/html")
    res.status(200).send(`
        <!DOCTYPE html>
        <html>
            <head>
                <meta http-equiv="refresh" content="0;url=${url}">
            </head>
            <body>
                <script>
                    window.location.href = "${url}"
                </script>
                <p>Opening Minecraft...</p>
            </body>
        </html>
    `)
}