// Buscador

document.getElementById("search-option").addEventListener("click", function(event) {
    event.preventDefault();
    document.querySelector(".search-container-principal").style.display = 'flex';
    document.getElementById("search-option").style.display = 'none';
    document.getElementById("close-search").style.display = 'block';
});

// Cerrar el campo de búsqueda al hacer click

document.getElementById("close-search").addEventListener("click", function() {
    document.querySelector(".search-container-principal").style.display = 'none';
    document.getElementById("search-option").style.display = 'block';
    document.getElementById("close-search").style.display = 'none';
    document.getElementById("search-input-principal").value = '';
    document.getElementById("suggestions-container-principal").style.display = 'none';
});

// Función de debounce
function debounce(func, delay) {
    let timer;
    return function(...args) {
        clearTimeout(timer);
        timer = setTimeout(() => func.apply(this, args), delay);
    };
}

// Función de throttle
function throttle(func, limit) {
    let lastFunc;
    let lastRan;
    return function(...args) {
        if (!lastRan) {
            func.apply(this, args);
            lastRan = Date.now();
        } else {
            clearTimeout(lastFunc);
            lastFunc = setTimeout(function() {
                if (Date.now() - lastRan >= limit) {
                    func.apply(this, args);
                    lastRan = Date.now();
                }
            }, limit - (Date.now() - lastRan));
        }
    };
}

// Aplicar debounce y throttle a eventos
window.addEventListener('resize', debounce(function() {
    console.log('Resized');
}, 200));

document.addEventListener('scroll', throttle(function() {
    console.log('Scrolled');
}, 100));

// Función para remover acentos
function removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Buscar canciones
document.getElementById("search-input-principal").addEventListener("input", debounce(function() {
    const searchQuery = removeAccents(this.value.toLowerCase());
    const suggestionsContainer = document.getElementById("suggestions-container-principal");

    if (searchQuery.length === 0) {
        suggestionsContainer.style.display = 'none';
        return;
    }

    suggestionsContainer.innerHTML = '';
    const filteredSongs = allMusic.filter(song =>
        removeAccents(song.name.toLowerCase()).includes(searchQuery) ||
        removeAccents(song.artist.toLowerCase()).includes(searchQuery)
    );

    if (filteredSongs.length > 0) {
        filteredSongs.forEach(song => {
            const suggestionItem = document.createElement('div');
            suggestionItem.classList.add('suggestion-item');

            if (isCurrentSong(song.name, song.artist)) {
                suggestionItem.innerHTML = `<strong>${song.name} - ${song.artist}</strong>`;
            } else {
                suggestionItem.innerHTML = `${song.name} - ${song.artist}`;
            }

            suggestionItem.addEventListener("click", () => {
                selectSongByName(song.name, song.artist);

                document.querySelector(".search-container-principal").style.display = 'none';
                document.getElementById("search-option").style.display = 'block';
                document.getElementById("close-search").style.display = 'none';
            });

            suggestionsContainer.appendChild(suggestionItem);
        });
        suggestionsContainer.style.display = 'block';
    } else {
        suggestionsContainer.style.display = 'none';
    }
}, 300)); // Delay de 300ms

function selectSongByName(songName, songArtist) {
    const songIndex = allMusic.findIndex(song => removeAccents(song.name.toLowerCase()) === removeAccents(songName.toLowerCase()) && removeAccents(song.artist.toLowerCase()) === removeAccents(songArtist.toLowerCase()));
    if (songIndex !== -1) {
        musicIndex = songIndex;
        loadMusic(musicIndex);
        playMusic(); 
        updatePlayingSong();
        document.querySelector(".wrapper").classList.remove("show-search");
        document.getElementById("suggestions-container-principal").style.display = 'none'; 
        document.getElementById("search-input-principal").value = ''; 
    }
}

function isCurrentSong(songName, songArtist) {
    return removeAccents(musicName.innerHTML.toLowerCase()).includes(removeAccents(songName.toLowerCase())) && removeAccents(musicArtist.innerText.toLowerCase()).includes(removeAccents(songArtist.toLowerCase()));
}

// Actualiza la canción en reproducción
function updatePlayingSong() {
    const allLiTags = ulTag.querySelectorAll("li");

    allLiTags.forEach((li) => {
        li.classList.remove("playing");
        const nameTag = li.querySelector("span");
        const artistTag = li.querySelector("p");
        if (nameTag) {
            nameTag.style.fontWeight = "normal";
        }
        if (artistTag) {
            artistTag.style.fontWeight = "normal";
        }
    });

    const currentLi = ulTag.querySelector(`li[li-index="${musicIndex + 1}"]`);
    if (currentLi) {
        currentLi.classList.add("playing");
        const currentNameTag = currentLi.querySelector("span");
        const currentArtistTag = currentLi.querySelector("p");
        if (currentNameTag) {
            currentNameTag.style.fontWeight = "bold";
        }
        if (currentArtistTag) {
            currentArtistTag.style.fontWeight = "bold";
        }
    }
    
    const suggestionsContainer = document.getElementById("suggestions-container");
    if (suggestionsContainer) {
        const suggestionItems = suggestionsContainer.querySelectorAll(".suggestion-item");
        suggestionItems.forEach((item) => {
            item.classList.remove("playing");
            item.innerHTML = item.innerText;
        });

        const currentSuggestionItem = suggestionsContainer.querySelector(`.suggestion-item[li-index="${musicIndex + 1}"]`);
        if (currentSuggestionItem) {
            currentSuggestionItem.classList.add("playing");
            const songName = musicName.innerHTML;
            const songArtist = musicArtist.innerText;
            currentSuggestionItem.innerHTML = `<strong>${songName} - ${songArtist}</strong>`;
        }
    }
}

// Controles de la pestaña

if ('mediaSession' in navigator) {
    function updateMetadata() {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: musicName.innerHTML,
            artist: musicArtist.innerText,
            album: '',
            artwork: [
                { src: `img/${allMusic[musicIndex].img}.jpg`, sizes: '96x96', type: 'image/jpeg' },
                { src: `img/${allMusic[musicIndex].img}.jpg`, sizes: '128x128', type: 'image/jpeg' },
                { src: `img/${allMusic[musicIndex].img}.jpg`, sizes: '192x192', type: 'image/jpeg' },
                { src: `img/${allMusic[musicIndex].img}.jpg`, sizes: '256x256', type: 'image/jpeg' },
                { src: `img/${allMusic[musicIndex].img}.jpg`, sizes: '384x384', type: 'image/jpeg' },
                { src: `img/${allMusic[musicIndex].img}.jpg`, sizes: '512x512', type: 'image/jpeg' }
            ]
        });
    }

    navigator.mediaSession.setActionHandler('play', playMusic);
    navigator.mediaSession.setActionHandler('pause', pauseMusic);
    navigator.mediaSession.setActionHandler('previoustrack', prevMusic);
    navigator.mediaSession.setActionHandler('nexttrack', nextMusic);
    navigator.mediaSession.setActionHandler('seekbackward', () => {
        mainAudio.currentTime = Math.max(mainAudio.currentTime - 10, 0);
    });
    navigator.mediaSession.setActionHandler('seekforward', () => {
        mainAudio.currentTime = Math.min(mainAudio.currentTime + 10, mainAudio.duration);
    });
    navigator.mediaSession.setActionHandler('stop', () => {
        mainAudio.pause();
        mainAudio.currentTime = 0;
        playPauseBtn.querySelector('i').innerText = 'play_arrow';
        imgArea.classList.remove('playing');
        wrapper.classList.remove('paused');
    });
}

// Mantener la música en reproducción cuando la página no está visible
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        if (wrapper.classList.contains("paused")) {
            mainAudio.play();
            imgArea.classList.add("playing");
        }
    }
});

// Reproductor de música ______________________________________________________

const wrapper = document.querySelector(".wrapper"),
    imgArea = document.querySelector(".img-area"),
    musicImg = imgArea.querySelector("img"),
    musicName = wrapper.querySelector(".song-details .name"),
    musicArtist = wrapper.querySelector(".song-details .artist"),
    playPauseBtn = wrapper.querySelector(".play-pause"),
    prevBtn = document.querySelector("#prev"),
    nextBtn = document.querySelector("#next"),
    mainAudio = wrapper.querySelector("#main-audio"),
    progressArea = document.querySelector(".progress-area"),
    progressBar = progressArea.querySelector(".progress-bar"),
    repeatBtn = document.querySelector("#repeat-plist"),
    musicList = document.querySelector(".music-list"),
    moreMusicBtn = document.querySelector("#more-music"),
    closeMoreMusic = musicList.querySelector("#close"),
    ulTag = wrapper.querySelector("ul");

let musicIndex = Math.floor(Math.random() * allMusic.length);
let isMusicPaused = true;
let isShuffle = false;
let playedSongs = []; // Registro de canciones reproducidas
let preloadedSongs = []; // Registro de canciones precargadas
const increment = 50; // Número de canciones a cargar progresivamente
let loadedSongs = 0; // Control del número de canciones cargadas

// Ordena alfabéticamente los nombres de las canciones
allMusic.sort((a, b) => a.name.localeCompare(b.name));

window.addEventListener("load", () => {
    loadMusic(musicIndex);
    updatePlayingSong();
    displayAllSongs();
    updateMetadata();  // Actualiza la metadata al cargar
    preloadNextSongs(); // Precargar las próximas canciones
});

function loadMusic(index) {
    if (mainAudio.src) {
        mainAudio.pause();
        mainAudio.removeAttribute('src'); // Libera el recurso de audio anterior
        mainAudio.load();
    }

    // Carga solo la imagen si no está previamente cargada
    const song = allMusic[index];
    const formattedName = song.name.replace(/ - /g, ' <br> ');
    musicName.innerHTML = formattedName;
    musicArtist.innerText = song.artist;
    if (musicImg.dataset.src !== `img/${song.img}.jpg`) {
        musicImg.dataset.src = `img/${song.img}.jpg`;
        lazyLoadImage(musicImg); // Aplicar lazy loading
    }
    mainAudio.src = `music/${song.src}.mp3`;
    updateMetadata(); // Actualizar metadata al cargar
}

function playMusic() {
    if (mainAudio.src && mainAudio.paused) {
        wrapper.classList.add("paused");
        playPauseBtn.querySelector("i").innerText = "pause";
        mainAudio.play();
        imgArea.classList.add("playing");
        updateMetadata();  // Asegurar que la metadata está actualizada
    }
}

function pauseMusic() {
    if (!mainAudio.paused) {
        wrapper.classList.remove("paused");
        playPauseBtn.querySelector("i").innerText = "play_arrow";
        mainAudio.pause();
        imgArea.classList.remove("playing");
    }
}

playPauseBtn.addEventListener("click", () => {
    const isPlaying = !mainAudio.paused;
    isPlaying ? pauseMusic() : playMusic();
});

prevBtn.addEventListener("click", prevMusic);
nextBtn.addEventListener("click", nextMusic);

function prevMusic() {
    if (isShuffle) {
        playedSongs.pop();
    }
    musicIndex = (musicIndex - 1 + allMusic.length) % allMusic.length;
    loadMusic(musicIndex);
    playMusic();
    updatePlayingSong();
}

function nextMusic() {
    if (isShuffle) {
        shuffleMusic();
    } else {
        musicIndex = (musicIndex + 1) % allMusic.length;
        loadMusic(musicIndex);
        playMusic();
        updatePlayingSong();
    }

    // Precargar más canciones si llegamos al final
    if (musicIndex % increment === 0 && musicIndex > 0 && loadedSongs < allMusic.length) {
        preloadNextSongs();
    }
}

mainAudio.addEventListener("timeupdate", (e) => {
    if (mainAudio.duration) {
        const progressWidth = (e.target.currentTime / mainAudio.duration) * 100;
        progressBar.style.width = `${progressWidth}%`;
        updateCurrentTime(e.target.currentTime);
    }
});

function updateCurrentTime(currentTime) {
    const currentMin = Math.floor(currentTime / 60);
    const currentSec = Math.floor(currentTime % 60).toString().padStart(2, "0");
    wrapper.querySelector(".current-time").innerText = `${currentMin}:${currentSec}`;
}

mainAudio.addEventListener("loadeddata", () => {
    const totalMin = Math.floor(mainAudio.duration / 60);
    const totalSec = Math.floor(mainAudio.duration % 60).toString().padStart(2, "0");
    wrapper.querySelector(".max-duration").innerText = `${totalMin}:${totalSec}`;
});

progressArea.addEventListener("click", (e) => {
    const progressWidth = progressArea.clientWidth;
    const clickedOffsetX = e.offsetX;
    const newTime = (clickedOffsetX / progressWidth) * mainAudio.duration;
    mainAudio.currentTime = newTime;
    if (!mainAudio.paused) {
        playMusic();
    }
    updatePlayingSong();
});

repeatBtn.addEventListener("click", () => {
    switch (repeatBtn.innerText) {
        case "repeat":
            repeatBtn.innerText = "repeat_one";
            repeatBtn.setAttribute("title", "Song looped");
            isShuffle = false;
            break;
        case "repeat_one":
            repeatBtn.innerText = "shuffle";
            repeatBtn.setAttribute("title", "Playback shuffled");
            isShuffle = true;
            break;
        case "shuffle":
            repeatBtn.innerText = "repeat";
            repeatBtn.setAttribute("title", "Playlist looped");
            isShuffle = false;
            break;
    }
});

mainAudio.addEventListener("ended", () => {
    if (repeatBtn.innerText === "repeat_one") {
        mainAudio.currentTime = 0;
        playMusic();
    } else if (isShuffle) {
        shuffleMusic();
    } else {
        nextMusic();
    }
});

// Modo aleatorio ______________________________________________________

function shuffleMusic() {
    if (playedSongs.length >= allMusic.length) {
        playedSongs = [];
    }
    let randomIndex;
    do {
        randomIndex = Math.floor(Math.random() * allMusic.length);
    } while (playedSongs.includes(randomIndex));
    playedSongs.push(randomIndex);
    musicIndex = randomIndex;
    loadMusic(musicIndex);
    playMusic();
    updatePlayingSong();
}

function preloadNextSongs() {
    // Precargar las siguientes canciones
    const nextSetOfSongs = allMusic.slice(loadedSongs, loadedSongs + increment);
    nextSetOfSongs.forEach((song) => {
        const audio = new Audio();
        audio.src = `music/${song.src}.mp3`;
        audio.addEventListener("canplaythrough", () => {
            console.log(`Precargada: ${song.name}`);
        }, { once: true });
        preloadedSongs.push(audio);
    });
    loadedSongs += increment;
}

// Lazy Loading para imágenes ______________________________________________________

function lazyLoadImage(imageElement) {
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                observer.unobserve(img);
            }
        });
    });

    observer.observe(imageElement);
}

mainAudio.addEventListener("error", (e) => {
    console.error("Hay un error al cargar la canción amor:", e);
    nextMusic();
});

// Mouse ______________________________________________________

let isDragging = false;

function updateProgress(e) {
    const progressWidth = progressArea.clientWidth;
    const offsetX = e.touches ? e.touches[0].clientX - progressArea.getBoundingClientRect().left : e.offsetX;
    const newTime = (offsetX / progressWidth) * mainAudio.duration;
    mainAudio.currentTime = newTime;
    const progressPercentage = (mainAudio.currentTime / mainAudio.duration) * 100;
    progressBar.style.width = `${progressPercentage}%`;
}

// Mouse Eventos
progressArea.addEventListener('mousedown', (e) => {
    isDragging = true;
    updateProgress(e);
});

progressArea.addEventListener('mousemove', (e) => {
    if (isDragging) {
        updateProgress(e);
    }
});

progressArea.addEventListener('mouseup', (e) => {
    isDragging = false;
    updateProgress(e);
    if (!mainAudio.paused) {
        playMusic();
    }
});

progressArea.addEventListener('mouseleave', () => {
    isDragging = false;
});

// Touch Eventos
progressArea.addEventListener('touchstart', (e) => {
    isDragging = true;
    updateProgress(e);
}, { passive: true });

progressArea.addEventListener('touchstart', (e) => {
    isDragging = true;
    updateProgress(e);
}, { passive: true });

progressArea.addEventListener('touchmove', (e) => {
    if (isDragging) {
        updateProgress(e);
    }
}, { passive: true });

progressArea.addEventListener('touchend', (e) => {
    isDragging = false;
    updateProgress(e);
    if (!mainAudio.paused) {
        playMusic();
    }
}, { passive: true });

// Evento de scroll con throttle y pasivo
document.addEventListener('scroll', throttle(function() {
    console.log('Scrolled');
}, 100), { passive: true });

// Throttle function
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Lista de canciones ______________________________________________________

const gifNames = ["1", "2"];
const alphabet = ["#", ... "BCEFGHLMNPQRSUVY".split("")];
const backToAlphabetBtn = document.getElementById('back-to-alphabet');

function changeGif() {
    const randomIndex = Math.floor(Math.random() * gifNames.length);
    const gifName = gifNames[randomIndex];
    const danceGif = document.querySelector(".dance");
    danceGif.src = `img/${gifName}.gif`;
}

moreMusicBtn.addEventListener("click", () => {
    changeGif();
    document.querySelector(".alphabet-list").style.display = "block";
    musicList.classList.add("show");
    backToAlphabetBtn.classList.add("hidden"); 
});

backToAlphabetBtn.addEventListener("click", () => {
    showAlphabetList();
});

closeMoreMusic.addEventListener("click", () => {
    closeMusicList();
});

function closeMusicList() {
    musicList.classList.remove("show");
    backToAlphabetBtn.classList.add("hidden"); 
}

function loadSongsByLetter(letter) {
    ulTag.innerHTML = "";

    let filteredSongs;
    if (letter === "#") {
        filteredSongs = allMusic.filter(song => /^[^a-zA-Z]/.test(song.name));
    } else {
        filteredSongs = allMusic.filter(song => song.name.startsWith(letter));
    }

    if (filteredSongs.length > 0) {
        filteredSongs.forEach((song, index) => {
            const liTag = document.createElement('li');
            liTag.setAttribute('li-index', index + 1);
            liTag.innerHTML = `
                <div class="row">
                    <span>${song.name}</span>
                    <p>${song.artist}</p>
                </div>
                <audio class="${song.src}" src="songs/${song.src}.mp3"></audio>
            `;
            liTag.addEventListener("click", () => selectSong(liTag));
            ulTag.appendChild(liTag);
        });
    } else {
        ulTag.innerHTML = "<li>Ups hubo un error amor</li>";
    }

    updatePlayingSong();
    backToAlphabetBtn.classList.remove("hidden"); // Mostrar el icono de regreso cuando estamos en la lista de canciones
}

// Función para mostrar la lista del abecedario ______________________________________________________

function showAlphabetList() {
    ulTag.innerHTML = "";
    document.querySelector(".alphabet-list").style.display = "block"; // lista del abecedario
    musicList.classList.add("show");
    loadAlphabet();
    backToAlphabetBtn.classList.add("hidden"); 
}

// Abecedario y conteo de canciones ______________________________________________________

function loadAlphabet() {
    const alphabetList = document.getElementById('alphabet');
    alphabetList.innerHTML = '';

    alphabet.forEach(letter => {
        let songCount;
        if (letter === "#") {
            songCount = allMusic.filter(song => /^[^a-zA-Z]/.test(song.name)).length;
        } else {
            songCount = allMusic.filter(song => song.name.startsWith(letter)).length;
        }
        const liTag = `<li><a href="#" onclick="loadSongsByLetter('${letter}')">${letter} (<span id="count-${letter}">${songCount}</span>)</a></li>`;
        alphabetList.insertAdjacentHTML("beforeend", liTag);
    });
}

function selectSong(element) {
    const songIndex = allMusic.findIndex(song => song.name === element.querySelector('span').innerText);
    if (songIndex !== -1) {
        musicIndex = songIndex;
        loadMusic(musicIndex);
        playMusic();
        updatePlayingSong();
        backToAlphabetBtn.classList.remove("hidden"); // Muestra el icono de regreso cuando estamos en la lista de canciones
    }
}

function updatePlayingSong() {
    const allLiTags = ulTag.querySelectorAll("li");

    // Limpiar la clase 'playing'
    allLiTags.forEach((li) => {
        li.classList.remove("playing");
    });

    // Resaltar la canción actualmente en reproducción
    const currentLi = ulTag.querySelector(`li[li-index="${musicIndex + 1}"]`);
    if (currentLi) {
        currentLi.classList.add("playing");
    } else {
        console.log("Elemento no encontrado: ", `li[li-index="${musicIndex + 1}"]`);
    }
}

// Cargar el abecedario ______________________________________________________

window.addEventListener('load', () => {
    document.querySelector(".alphabet-list").style.display = "none";
    musicList.classList.remove("show"); 
    loadAlphabet(); 
    backToAlphabetBtn.classList.add("hidden");
});