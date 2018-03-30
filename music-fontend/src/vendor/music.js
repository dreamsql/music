import { searchMusic, getMusic } from './music-api';

class Music {
  constructor(type, name = '音乐') {
    this.type = type;
    this.name = name;
    this.songsList = [];
  }
  searchMusic(key, page, init='init') {
    return searchMusic(key, this.type, page).then((data) => {
      if (init == 'init') {
        this.songsList = [];
      }
      this.songsList = this.songsList.concat(data);
      return Promise.resolve(this.songsList);
    }).catch(() => {
      return Promise.reject();
    });
  }
  getMusic(id) {
    return getMusic(id, this.type);
  }
}

export default Music;
