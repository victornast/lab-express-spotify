require('dotenv').config();

const express = require('express');
const hbs = require('hbs');
const SpotifyWebApi = require('spotify-web-api-node');

// require spotify-web-api-node package here:
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET
});

// Retrieve an access token
spotifyApi
  .clientCredentialsGrant()
  .then((data) => spotifyApi.setAccessToken(data.body['access_token']))
  .catch((error) =>
    console.log('Something went wrong when retrieving an access token', error)
  );

const app = express();

app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));

// setting the spotify-api goes here:
// Our routes go here:

app.get('/', (request, response) => {
  response.render('home', { pageTitle: 'Home' });
});

app.get('/artist-search', (request, response) => {
  const searchQuery = request.query.q;
  spotifyApi
    .searchArtists(searchQuery)
    .then((data) => {
      // console.log('The received data from the API: ', data.body);
      // ----> 'HERE WHAT WE WANT TO DO AFTER RECEIVING THE DATA FROM THE API'
      // console.log(data.body.artists.items[0]);
      response.render('artist-search-results', {
        pageTitle: 'Search Results',
        artistList: data.body.artists
      });
    })
    .catch((err) =>
      console.log('The error while searching artists occurred: ', err)
    );
});

app.get('/albums/:artistId', (request, response) => {
  const artistId = request.params.artistId;
  spotifyApi
    .getArtistAlbums(artistId)
    .then((data) => {
      // console.log('Albums from API:', data.body);
      response.render('albums', {
        pageTitle: `Albums from ${data.body.items[0].artists[0].name}`,
        artistAlbums: data.body
      });
    })
    .catch((err) =>
      console.log('The error while searching albums occured: ', err)
    );
});

app.get('/tracks/:albumId', (request, response) => {
  const albumId = request.params.albumId;
  spotifyApi
    .getAlbumTracks(albumId, { limit: 5, offset: 1 })
    .then((data) => {
      console.log('Tracks: ', data.body);
      response.render('tracks', {
        pageTitle: 'Tracks',
        albumTracks: data.body
      });
    })
    .catch((err) =>
      console.log('The error while searching for tracks occured: ', err)
    );
});

app.get('*', (request, response) => {
  response.render('error', { pageTitle: '404' });
});

app.listen(3000, () =>
  console.log('My Spotify project running on port 3000 🎧 🥁 🎸 🔊')
);
