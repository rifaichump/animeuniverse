export default async function handler(req, res) {
  const link = "";
  const html = `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Anime Universe Group APK</title>

    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;

            font-family: Arial, Helvetica, sans-serif;
            color: white;

            background:
                radial-gradient(circle at 50% 25%, #5b21b6 0%, transparent 30%),
                radial-gradient(circle at 20% 80%, #7c3aed 0%, transparent 25%),
                radial-gradient(circle at 90% 90%, #4c1d95 0%, transparent 25%),
                #050507;

            overflow: hidden;
        }

        body::before {
            content: "";
            position: fixed;
            width: 350px;
            height: 350px;
            border-radius: 50%;
            background: #8b5cf6;
            filter: blur(140px);
            opacity: 0.18;
            top: -120px;
            left: 50%;
            transform: translateX(-50%);
            pointer-events: none;
        }

        .container {
            width: 100%;
            max-width: 460px;
            padding: 45px 30px;

            text-align: center;

            background: rgba(15, 10, 25, 0.72);
            border: 1px solid rgba(139, 92, 246, 0.3);
            border-radius: 28px;

            backdrop-filter: blur(18px);
            -webkit-backdrop-filter: blur(18px);

            box-shadow:
                0 0 40px rgba(124, 58, 237, 0.18),
                inset 0 0 30px rgba(139, 92, 246, 0.03);

            position: relative;
            z-index: 2;
        }

        .logo {
            width: 82px;
            height: 82px;
            margin: 0 auto 25px;

            display: flex;
            align-items: center;
            justify-content: center;

            border-radius: 24px;

            background: linear-gradient(
                135deg,
                #7c3aed,
                #a855f7,
                #4c1d95
            );

            box-shadow:
                0 0 25px rgba(168, 85, 247, 0.45),
                0 0 60px rgba(124, 58, 237, 0.2);

            font-size: 38px;
            font-weight: bold;
        }

        h1 {
            font-size: 28px;
            line-height: 1.25;
            margin-bottom: 12px;

            background: linear-gradient(
                90deg,
                #c084fc,
                #ffffff,
                #a855f7
            );

            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .version {
            display: inline-block;
            margin-bottom: 32px;

            padding: 8px 16px;

            border-radius: 999px;

            background: rgba(124, 58, 237, 0.12);
            border: 1px solid rgba(168, 85, 247, 0.25);

            color: #c4b5fd;
            font-size: 14px;
            letter-spacing: 0.5px;
        }

        .download {
            width: 100%;
            padding: 16px 24px;

            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;

            border: none;
            border-radius: 16px;

            background: linear-gradient(
                135deg,
                #7c3aed,
                #9333ea,
                #6d28d9
            );

            color: white;
            font-size: 16px;
            font-weight: bold;

            cursor: pointer;
            text-decoration: none;

            box-shadow:
                0 8px 25px rgba(124, 58, 237, 0.35);

            transition: all 0.25s ease;
        }

        .download:hover {
            transform: translateY(-3px);

            box-shadow:
                0 12px 35px rgba(168, 85, 247, 0.5);

            filter: brightness(1.1);
        }

        .download:active {
            transform: translateY(0);
        }

        .download-icon {
            font-size: 20px;
        }

        .footer {
            margin-top: 25px;
            color: #777080;
            font-size: 12px;
        }

        @media (max-width: 480px) {
            .container {
                padding: 38px 22px;
                border-radius: 24px;
            }

            h1 {
                font-size: 24px;
            }

            .logo {
                width: 72px;
                height: 72px;
                font-size: 32px;
            }
        }
    </style>
</head>

<body>

    <main class="container">
        <h1>Anime Universe Group APk</h1>

        <div class="version">
            Versi Terbaru
        </div>

        <a
            class="download"
            href="${link}"
            download
        >
            <span class="download-icon">↓</span>
            Unduh Sekarang
        </a>

        <div class="footer">
            Hapus aplikasi sebelumnya jika tidak dapat terpasang.
        </div>

    </main>

</body>
</html>
  `
  res.setHeader("Content-Type", "text/html");
  res.send(html);
}
