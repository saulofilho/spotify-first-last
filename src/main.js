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

async function searchArtist(artistName, token) {
  const result = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(artistName)}&type=artist&limit=1`, {
    headers: {
      'Authorization': 'Bearer ' + token
    }
  });
  const data = await result.json();
  return data.artists.items[0];
}

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

async function getAlbumTracks(albumId, token) {
  const result = await fetch(`https://api.spotify.com/v1/albums/${albumId}/tracks?market=US`, {
    headers: {
      'Authorization': 'Bearer ' + token
    }
  });
  const data = await result.json();
  return data.items;
}

function getRandomTrack(tracks) {
  if (tracks.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * tracks.length);
  return tracks[randomIndex];
}

function displayResult(content) {
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = content;
}

async function searchAndDisplay(event) {
  event.preventDefault();

  const bandName = document.getElementById('bandName').value;
  displayResult('<p>Searching for information... please wait.</p>');

  try {
    const token = await getToken();
    const artist = await searchArtist(bandName, token);
    if (!artist) {
      displayResult('<p>Artista não encontrado.</p>');
      return;
    }

    let albums = await getArtistAlbums(artist.id, token);
    if (!albums || albums.length === 0) {
      displayResult('<p>Álbuns não encontrados para este artista.</p>');
      return;
    }

    // Ordena os álbuns pela data de lançamento (crescente)
    albums.sort((a, b) => new Date(a.release_date) - new Date(b.release_date));
    const firstAlbum = albums[0];
    const lastAlbum = albums[albums.length - 1];

    // Buscar faixas do primeiro álbum
    const firstAlbumTracks = await getAlbumTracks(firstAlbum.id, token);
    const randomTrackFirstAlbum = getRandomTrack(firstAlbumTracks);

    // Buscar faixas do último álbum
    const lastAlbumTracks = await getAlbumTracks(lastAlbum.id, token);
    const randomTrackLastAlbum = getRandomTrack(lastAlbumTracks);

    let resultHTML = `<div class="result-item">
      <h2>Artist: ${artist.name}</h2>
      <h3>First Album: ${firstAlbum.name} (${firstAlbum.release_date})</h3>`;
    
    if (randomTrackFirstAlbum) {
      resultHTML += `<p>Random track: ${randomTrackFirstAlbum.name}</p>`;
      // Utiliza o embed player do Spotify, passando o ID da faixa
      resultHTML += `<iframe src="https://open.spotify.com/embed/track/${randomTrackFirstAlbum.id}" width="300" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>`;
    } else {
      resultHTML += `<p>No tracks found for this album.</p>`;
    }
    resultHTML += `</div>`;

    resultHTML += `<div class="result-item">
      <h3>Last Album: ${lastAlbum.name} (${lastAlbum.release_date})</h3>`;
    if (randomTrackLastAlbum) {
      resultHTML += `<p>Faixa aleatória: ${randomTrackLastAlbum.name}</p>`;
      resultHTML += `<iframe src="https://open.spotify.com/embed/track/${randomTrackLastAlbum.id}" width="300" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>`;
    } else {
      resultHTML += `<p>No tracks found for this album.</p>`;
    }
    resultHTML += `</div>`;

    displayResult(resultHTML);

  } catch (error) {
    console.error('Error:', error);
    displayResult('<p>An error occurred while fetching data. Check the console for more information.</p>');
  }
}

document.getElementById('artistForm').addEventListener('submit', searchAndDisplay);
