function decode(text) {
  return Buffer.from(text, "base64url").toString();
}
export default async function handler(req, res) {
  const { id } = req.query;
  if (!id) {
    res.status(404).json({
      status: false,
      msg: "No url directed",
      data: id
    });
  }
  try {
    const idd = decode(id);
    if (!/animeunicraft/.test(idd)) {
      res.status(404).json({
        status: false,
        msg: "No url directed",
        data: idd
      });
    }
    res.redirect(url);
  } catch (e) {
    res.status(404).json({
      status: false,
      msg: "No url directed",
      data: e.message
    });
  }
}