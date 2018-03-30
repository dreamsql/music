import axios from 'axios';
import { base as SETTING } from '@/config/setting';
const baseUrl = SETTING.baseUrl;



const searchMusic = (key, type, page = 1, limit = 20) => {
    if (!type) {
        return Promise.reject();
    }
    return axios.get(`${baseUrl}/api/search/song/${type}`, {
        params: {
            key,
            page,
            limit,
        },
    }).then((data) => {
        if (!data.success) {
            return Promise.reject();
        }
        const songs = data.songList;
        const songsList = [];
        for (let i = 0, len = songs.length; i < len; i++) {
            // if (songs[i].copyrightId) {
            songsList.push({
                id: songs[i].id + '',
                name: songs[i].name,
                album: songs[i].album,
                // artist: songs[i].artists.map((song) => {
                //   return song.name;
                // }).join('/'),
                artists: songs[i].artists,
                type,
            });
            // }
        }
        // if (songs.length < 10) {
        //     return Promise.reject();
        // }
        return Promise.resolve(songsList);
    }).catch(() => {
        return Promise.reject();
    });
}
const getMusic = (id, type) => {
    return axios.get(`${baseUrl}/api/get/song/${type}`, {
        params: { id }
    }).then((data) => {
        return Promise.resolve(data);
    });
}

export {
    getMusic,
    searchMusic
};