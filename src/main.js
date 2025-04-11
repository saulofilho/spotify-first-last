// import './style.css'
// import javascriptLogo from './javascript.svg'
// import viteLogo from '/vite.svg'
// import { setupCounter } from './counter.js'

// document.querySelector('#app').innerHTML = `
//   <div>
//     <a href="https://vite.dev" target="_blank">
//       <img src="${viteLogo}" class="logo" alt="Vite logo" />
//     </a>
//     <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank">
//       <img src="${javascriptLogo}" class="logo vanilla" alt="JavaScript logo" />
//     </a>
//     <h1>Hello Vite!</h1>
//     <div class="card">
//       <button id="counter" type="button"></button>
//     </div>
//     <p class="read-the-docs">
//       Click on the Vite logo to learn more
//     </p>
//   </div>
// `

// setupCounter(document.querySelector('#counter'))

// main.js
const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const clientSecret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;

async function getToken() {
  const result = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
    },
    body: 'grant_type=client_credentials'
  });
  const data = await result.json();
  return data.access_token;
}

// Função para buscar o artista na API do Spotify
async function searchArtist(artistName, token) {
  const result = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(artistName)}&type=artist&limit=1`, {
    headers: {
      'Authorization': 'Bearer ' + token
    }
  });
  const data = await result.json();
  return data.artists.items[0];
}

// Função para obter os álbuns do artista (somente álbuns, descartando singles)
async function getArtistAlbums(artistId, token) {
  const result = await fetch(`https://api.spotify.com/v1/artists/${artistId}/albums?include_groups=album&market=US&limit=50`, {
    headers: {
      'Authorization': 'Bearer ' + token
    }
  });
  const data = await result.json();
  // Remover álbuns duplicados (várias versões do mesmo álbum)
  const uniqueAlbums = {};
  data.items.forEach(album => {
    if (!uniqueAlbums[album.name]) {
      uniqueAlbums[album.name] = album;
    }
  });
  return Object.values(uniqueAlbums);
}

// Função para buscar as faixas de um álbum
async function getAlbumTracks(albumId, token) {
  const result = await fetch(`https://api.spotify.com/v1/albums/${albumId}/tracks?market=US`, {
    headers: {
      'Authorization': 'Bearer ' + token
    }
  });
  const data = await result.json();
  return data.items;
}

// Função para selecionar uma faixa aleatória de uma lista de faixas
function getRandomTrack(tracks) {
  if (tracks.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * tracks.length);
  return tracks[randomIndex];
}

// Função para exibir os resultados na página
function displayResult(content) {
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = content;
}

// Função principal que coordena a busca e exibição dos dados
async function searchAndDisplay(event) {
  event.preventDefault();
  
  const bandName = document.getElementById('bandName').value;
  displayResult('<p>Buscando informações... aguarde.</p>');
  
  try {
    // Obter token de acesso
    const token = await getToken();
    
    // Buscar artista
    const artist = await searchArtist(bandName, token);
    if (!artist) {
      displayResult('<p>Artista não encontrado.</p>');
      return;
    }
    
    // Buscar álbuns do artista
    let albums = await getArtistAlbums(artist.id, token);
    if (!albums || albums.length === 0) {
      displayResult('<p>Álbuns não encontrados para este artista.</p>');
      return;
    }
    
    // Ordenar os álbuns pela data de lançamento (crescente)
    albums.sort((a, b) => new Date(a.release_date) - new Date(b.release_date));
    
    const firstAlbum = albums[0];
    const lastAlbum = albums[albums.length - 1];
    
    // Buscar as faixas do primeiro álbum
    const firstAlbumTracks = await getAlbumTracks(firstAlbum.id, token);
    const randomTrackFirstAlbum = getRandomTrack(firstAlbumTracks);
    
    // Buscar as faixas do último álbum
    const lastAlbumTracks = await getAlbumTracks(lastAlbum.id, token);
    const randomTrackLastAlbum = getRandomTrack(lastAlbumTracks);
    
    // Montar o HTML com os resultados
    let resultHTML = `<div class="result-item">
      <h2>Artista: ${artist.name}</h2>
      <h3>Primeiro Álbum: ${firstAlbum.name} (${firstAlbum.release_date})</h3>`;
    if (randomTrackFirstAlbum) {
      resultHTML += `<p>Faixa aleatória: ${randomTrackFirstAlbum.name}</p>`;
      if (randomTrackFirstAlbum.preview_url) {
        resultHTML += `<audio controls src="${randomTrackFirstAlbum.preview_url}"></audio>`;
      }
    } else {
      resultHTML += `<p>Não foram encontradas faixas para este álbum.</p>`;
    }
    resultHTML += `</div>`;
    
    resultHTML += `<div class="result-item">
      <h3>Último Álbum: ${lastAlbum.name} (${lastAlbum.release_date})</h3>`;
    if (randomTrackLastAlbum) {
      resultHTML += `<p>Faixa aleatória: ${randomTrackLastAlbum.name}</p>`;
      if (randomTrackLastAlbum.preview_url) {
        resultHTML += `<audio controls src="${randomTrackLastAlbum.preview_url}"></audio>`;
      }
    } else {
      resultHTML += `<p>Não foram encontradas faixas para este álbum.</p>`;
    }
    resultHTML += `</div>`;
    
    displayResult(resultHTML);
    
  } catch (error) {
    console.error('Erro:', error);
    displayResult('<p>Ocorreu um erro ao buscar os dados. Verifique o console para mais informações.</p>');
  }
}

// Adiciona o evento de submit ao formulário
document.getElementById('artistForm').addEventListener('submit', searchAndDisplay);
