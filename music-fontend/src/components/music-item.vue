<template lang="html">
<div class="music-item">
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="position: absolute; width: 0px; height: 0px; overflow: hidden;"><defs><symbol id="icon-play3" viewBox="0 0 32 32"><title>play3</title> <path d="M6 4l20 12-20 12z"></path></symbol></defs></svg>
    <div class="item-info">
      <p>
        <small v-if="music.openId == 'backend'">(后台)</small>
        {{music.name}} -- <span class="item-album">{{music.type | type}}</span>
      </p>
      <small>
        <span class="item-author">{{music.artists | artist}}</span>
        -
        <span class="item-album">{{music.album.name}}</span>
        <template v-if="type=='history'">
          <span class="item-album pull-right" style="font-size:10px;">{{new Date(music.createdAt).toLocaleString()}}</span>
        </template>
      </small>
    </div>
    <div class="item-btn">
      <icon type="top" 
        v-if="music.top && type=='list'" 
        title="置顶">
      </icon>
      <el-dropdown 
        v-if="type == 'search' || type == 'history'" 
        trigger="click" 
        menu-align='start'>
        <el-button size="mini" icon="plus"></el-button>
        <el-dropdown-menu slot="dropdown">
        <el-dropdown-item @click.native="$emit('appendToList', index, music)" v-for='(musicItem, index) in musicList'>{{musicItem.name}}</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <el-button 
        v-if="type == 'search' || type == 'history'" 
        size="mini" 
        @click.native="$emit('playMusic')" 
        icon="caret-right">
      </el-button>
      <span v-if="type == 'mobileplay'" style="color: #aaa">
        <svg class="icon icon-play3" @click="$emit('playMusic')"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon-play3"></use></svg>
      </span>
    </div>
  </div>
</template>

<script>
import { typeFilter, artistFilter } from '@/vendor/filters';
import icon from './icon';

export default {
  filters: {
    type: typeFilter,
    artist: artistFilter,
  },
  components: {
    icon,
  },
  props: {
    // 类型 history/search
    type: {
      type: String,
      default: 'search',
    },
    // 歌单
    musicList: {
      type: Array,
      default() {
        return [];
      }
    },
    // 音乐信息
    music: {
      type: Object,
      default() {
        return {
          name: '标题',
          artist: '作者',
          album: '专辑',
        };
      },
    },
  },
};
</script>
