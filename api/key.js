export default function handler(req, res) {
  const remaining = 86400000;
  res.status(200).json({
    "ok": true,
    "expiryMs": new Date() * 1 + remaining,
    "remainingMs": remaining
  });
}
