export default function handler(req, res) {
    let url = `https://github.com/rifaichump/animeuniverse/releases/download/Update/app-debug.apk`
    
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