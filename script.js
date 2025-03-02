console.log(window)
function tampilkanMedia() {
    const mediaContainer = document.getElementById("media-container");

    // Bersihkan isi sebelumnya
    mediaContainer.innerHTML = "";

    // Tambahkan kelas untuk scroll horizontal
    mediaContainer.classList.add("media-scroll");

    // Daftar gambar yang akan ditampilkan
    const images = [
      'images/IMG-20250227-WA0010.jpg',
      'images/IMG-20250227-WA0011.jpg',
      'images/IMG-20250227-WA0012.jpg',
      'images/IMG-20250227-WA0013.jpg',
      'images/IMG-20250227-WA0014.jpg',
      'images/IMG-20250228-WA0573.jpg',
      'images/IMG-20250228-WA0574.jpg',
      'images/IMG-20250228-WA0575.jpg',
      'images/IMG-20250228-WA0576.jpg',
      'images/IMG-20250228-WA0726.jpg',
      'images/IMG-20250302-WA0257.jpg',
      'images/IMG-20250302-WA0258.jpg',
      'images/IMG-20250302-WA0368.jpg'
    ];

    // Buat wrapper untuk scroll
    const mediaWrapper = document.createElement("div");
    mediaWrapper.classList.add("media-wrapper");

    images.forEach(src => {
        // Buat kotak pembungkus gambar
        const mediaBox = document.createElement("div");
        mediaBox.classList.add("media-box");

        // Tambahkan gambar
        const img = document.createElement("img");
        img.src = src;
        img.alt = "Gambar Historis";
        img.classList.add("media-item");
        
        mediaBox.appendChild(img);
        mediaWrapper.appendChild(mediaBox);
    });

    mediaContainer.appendChild(mediaWrapper);
}


setInterval(async() => {
  const aternos = document.getElementById("aternos");
  try {
    const data = await (await fetch("https://api.mcstatus.io/v2/status/bedrock/AnimeUnicraft.aternos.me:12698")).json();
    if(data && data.online) {
      aternos.innerHTML = `
      <p class="server-status">Status: Online</p>
      <p class="server-status">Players: ${data.players.online}/${data.players.max}</p>
      `;
      document.getElementById("text-menunggu-section").textContent = "";
    } else {
      aternos.innerHTML = `
      <p class="server-status">Status: Offline</p>
      `;
      document.getElementById("text-menunggu-section").textContent = "";
    }
  } catch (e) {
    aternos.innerHTML = `
    <p class="server-status">Status: Unknown</p>
    `;
    document.getElementById("text-menunggu-section").textContent = "";
  }
}, 0)