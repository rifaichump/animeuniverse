const carouselImg = document.getElementById("carousel-inner-img")
let htmlCarouselImg = ''

const carouselVid = document.getElementById("carousel-inner-vid")
let htmlCarouselVid = ''

for(let i = 0; i < 21; i++) {
  htmlCarouselImg += `
  <div class="carousel-item ${i+1 == 1 ? 'active' : ''}">
    <img src="images/moment/${i+1}.jpg" class="d-block w-100" alt="Gambar ${i+1}">
  </div>
  `
}

for(let i = 0; i < 4; i++) {
  htmlCarouselVid += `
  <div class="carousel-item ${i+1 == 1 ? 'active' : ''}">
      <div class="video-wrapper">
          <video id="video${i+1}">
              <source src="videos/moment/${i+1}.mp4">
              Browser Anda tidak mendukung elemen video.
          </video>
      </div>
  </div>
  `
}

carouselImg.innerHTML = htmlCarouselImg
carouselVid.innerHTML = htmlCarouselVid

const typeWaifu = document.getElementById('type-waifu')
const uploadStatus = document.getElementById('image-result')
const btnSubmit = document.getElementById('submit-btn')

function clearImage() {
  uploadStatus.innerHTML = ""
  btnSubmit.disabled = false
}


async function generateImage() {
  let [name, type] = typeWaifu.value.split` `
  try {
    btnSubmit.disabled = true
    const response = await fetch(`https://api.waifu.pics/${type}/${name}`)
    const data = await response.json()
    const src = data.url
    
    for(let i = 5;i > 0;i--) {
      uploadStatus.innerHTML = `<div class="alert alert-success">${type == "nsfw" ? 'Njir mau coli kah?, Tunggu ya bro' : 'Tunggu'}...${i}</div>`
      await new Promise(_ => setTimeout(_, 1000))
    }
    uploadStatus.innerHTML = `<div class="alert alert-success">${type == "nsfw" ? 'Njir mau coli kah?, Tunggu ya bro' : 'Tunggu'}...0</div>`
    await new Promise(_ => setTimeout(_, 1000))
    
    uploadStatus.innerHTML = `
        <img src="${src}" class="img-fluid mb-3" alt="Result Image">
        <button type="button" class="btn btn-success" onclick="generateImage()">Retry</button>
        <button type="button" class="btn btn-danger" onclick="clearImage()">Clear</button>
    `
  } catch(e) {
    uploadStatus.innerHTML = `<div class="alert alert-danger">${e.message}</div>`
  }
}

var carousel = document.getElementById('videoCarousel');
carousel.addEventListener('slide.bs.carousel', function (event) {
    var activeVideo = document.querySelector('.carousel-item.active video');
    if (activeVideo) {
        activeVideo.pause();
    }
    
    var nextVideo = event.relatedTarget.querySelector('video');
    if (nextVideo) {
        nextVideo.play();
    }
});

window.addEventListener('load', function() {
    var firstVideo = document.querySelector('.carousel-item.active video');
    if (firstVideo) {
        firstVideo.play();
    }
});

(async() => {
  
})()