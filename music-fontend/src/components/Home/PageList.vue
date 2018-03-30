<template lang="html">
  <div style="padding-bottom:50px;height:100%;overflow:auto;">
    <div class="music-play">
      <div class="music-cover">
        <img :src="now.album.cover" height="80" alt="">
      </div>
      <div class="music-info">
        <h3>{{now.name}}<span> -- {{now.type | type}}</span></h3>
        <small>
          <span class="item-author">{{now.artists | artist}}</span>
          -
          <span class="item-album">{{now.album.name}}</span>
        </small>
      </div>
    </div>
    <music-item
      v-for="(music, index) in sortMusicList"
      type="list"
      :key="index"
      :music="music"
      :playList="playList"
      >
    </music-item>
    <p style="text-align:center;margin: 5px 0;">共点了{{sortMusicList.length}}首歌</p>
  </div>
</template>

<script>
import musicItem from '@/components/music-item';
import { LocalStore as Store } from '@/vendor/store';
import { artistFilter, typeFilter } from '@/vendor/filters';

export default {
  computed: {
    // 排序的歌曲不包含正在播放的歌曲
    sortMusicList() {
      return this.musicList.slice(1);
    },
    // 现在播放的歌曲
    now() {
      return this.musicList[0];
    }
  },
  filters: {
    artist: artistFilter,
    type: typeFilter,
  },
  props: {
    // 接收的musicList
    musicList: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  components: {
    musicItem,
  },
  data() {
    return {
      playList: [],
    };
  },
};
</script>

<style lang="less">
  .music-play {
    padding: 10px;
    border-bottom: 1px solid #ddd;
    .music-cover, .music-info {
      display: inline-block;
      vertical-align: middle;
    }
    .music-info {
      margin-left: 10px;
      h3 {
        margin: 0;
        margin-bottom: 5px;
        span{
          font-size: 14px;
          font-weight: normal;
          color: #999;
        }
      }
    }
  }
</style>
