export default function handler(req, res) {
  const ip = 'animeunicraft.my.id';
  const port = '19132';
  const url = `minecraft://?addExternalServer=AnimeUnicraftReal|${ip}:${port}`;

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Membuka Minecraft...</title>
    </head>
    <body>
      <script>
        window.location.href = "${url}";
      </script>

      <p>Jika Minecraft tidak terbuka otomatis,
        <a href="${url}">klik di sini</a>.
      </p>
    </body>
    </html>
  `);
}
