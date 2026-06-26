export default function handler(req, res) {
    let ip = "animeunicraft.my.id"
    let port = "19132"
    let url = `minecraft://?addExternalServer=AnimeUnicraftReal|${ip}:${port}`
    
    res.redirect(307, url);
}
