const MusicApi = require('music-api');
const router = require('express').Router();
const axios = require('axios');

// 搜索歌曲
router.get('/search/song/:vendor', (req, res) => {
  let vendor = req.params.vendor;
  MusicApi.searchSong(vendor, req.query || {})
    .then(data => res.json(data))
    .catch(err => res.send(err))
});

// 搜索专辑
router.get('/search/album/:vendor', (req, res) => {
  let vendor = req.params.vendor;
  MusicApi.searchAlbum(vendor, req.query || {})
    .then(data => res.json(data))
    .catch(err => res.send(err))
});

// 搜索歌曲列表
router.get('/search/playlist/:vendor', (req, res) => {
  let vendor = req.params.vendor;
  MusicApi.searchPlaylist(vendor, req.query || {})
    .then(data => res.json(data))
    .catch(err => res.send(err))
})

// 获取歌曲
router.get('/get/song/:vendor', (req, res) => {
  let vendor = req.params.vendor;
  MusicApi.getSong(vendor, req.query || {})
    .then(data => res.json(data))
    .catch(err => res.send(err))
});

// 获取专辑
router.get('/get/album/:vendor', (req, res) => {
  let vendor = req.params.vendor;
  MusicApi.getAlbum(vendor, req.query || {})
    .then(data => res.json(data))
    .catch(err => res.send(err))
});

// 获取播放列表
router.get('/get/playlist/:vendor', (req, res) => {
  let vendor = req.params.vendor;
  MusicApi.getPlaylist(vendor, req.query || {})
    .then(data => res.json(data))
    .catch(err => res.send(err))
});

router.get('/suggest/album/:vendor', (req, res) => {
  let limit = req.query.limit,
      raw = req.query.raw;
  let vendor = req.params.vendor;
  MusicApi.getSuggestAlbums(vendor, req.query || {})
    .then(data => res.json(data))
    .catch(err => res.send(err))
});

module.exports = router;