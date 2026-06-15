export default async function handler(req, res) {
  try {
    const url = Buffer
      .from(req.query.id, "base64url")
      .toString("utf8");

    const response = await fetch(url);

    if (!response.ok) {
      return res.status(404).json({
        success: false,
        msg: "File not found"
      });
    }

    const buffer = Buffer.from(
      await response.arrayBuffer()
    );

    res.setHeader(
      "Content-Type",
      response.headers.get("content-type") ||
      "application/octet-stream"
    );

    const filename = url.split("/").pop();

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}"`
    );

    res.send(buffer);

  } catch (e) {
    res.status(500).json({
      success: false,
      error: e.message
    });
  }
}