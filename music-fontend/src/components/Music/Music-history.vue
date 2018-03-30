<template lang="html">
  <el-card class="box-card" style="padding-bottom: 55px;">
    <div slot="header">
      <p>播放历史（共{{musicList.length}}首歌）<small class="gray">只显示最近100条历史</small></p>
    </div>
    <music-item @appendToList="appendToList" @playMusic="playMusic(index)" v-for="(music, index) in musicList" :key="index" :music="music" type="history" :musicList='shop_music_list'></music-item>
  </el-card>
</template>

<script>
import _ from 'lodash';
import { dataParseJson } from '@/vendor/project';
import musicItem from '@/components/music-item';
import { LocalStore as Store } from '@/vendor/store';

export default {
  components: {
    musicItem,
  },
  created() {
    // 订阅歌单的变化
    const list_query = new this.$database.Query('shop_music_list');
    list_query.subscribe().then((liveQuery) => {
        // 用户新点播歌曲时自动添加歌曲到列表
      liveQuery.on('update', (updateItem) => {
        console.log('update');
        const list = updateItem.get('list');
        this.$bus.musicList.list = list;
      });
      liveQuery.on('delete', (deleteItem) => {
        console.log('delete');
        const list = deleteItem.get('list');
        this.$bus.musicList.list = list;
      });
    })
    // 订阅历史的变化
    this.$bus.getShop().then((shopData) => {
      const query = new this.$database.Query('history');
      const shop = this.$database.Object.createWithoutData('shop', shopData.objectId);
      query.descending('createdAt');
      query.equalTo('shop', shop);
      query.find().then((data) => {
        this.musicList = dataParseJson(data);
      });
      query.subscribe().then((liveQuery) => {
        liveQuery.on('create', (createItem) => {
          this.musicList.unshift(dataParseJson(createItem));
          (this.musicList.length > 100) && (this.musicList.length = 100);
        });
      });
    });
  },
  methods: {
    //加入歌单
    appendToList(index, music) {
      const music_list_id = this.$bus.musicList.objectId;
      const query = new this.$database.Query('shop_music_list');
      query.get(music_list_id).then((music_list) => {
        const curList = music_list.get('list');
        const curListCld = curList[index].children;
        // 检测歌单里面歌曲是否重复
        curListCld.forEach((item) => {
          if (item.id == music.id) {
            throw {
              code: 137
            };
          }
        })
        music.index = index;
        // 加入歌曲到歌单
        curListCld.push(music);
        music_list.set('list', curList);
        music_list.save().then((item) => {
          this.$notify.success({
            title: '添加成功',
            message: `添加歌曲《${music.name}》到歌单成功`,
          });
        });
      }).catch((error) => {
        let message;
        switch(error.code) {
          case 137:
            message = '当前歌曲已存在播放列表中';
            break;
          default:
            message = '出现异常错误，请稍后重试！';
        }
        this.$message.error(message);
      }).then(() => {
        this.loading = false;
      });
    },
    playMusic(index) {
      const music = _.clone(this.musicList[index], true);
      delete music.objectId;
      delete music.createdAt;
      delete music.updatedAt;
      delete music.order;
      delete music.status;
      delete music.openId;
      delete music.shop;
      delete music.qrcode;
      delete music.top;
      const Playlist = this.$database.Object.extend('playlist');
      const playlist = new Playlist();
      const shopData = Store.get('shop');
      const shop = this.$database.Object.createWithoutData('shop', shopData.objectId);
      const qrcode = this.$database.Object.createWithoutData('qrcode', shopData.qrcode.objectId);
      playlist.set(music);
      playlist.set('status', 0);
      playlist.set('openId', 'backend');
      playlist.set('shop', shop);
      playlist.set('qrcode', qrcode);
      playlist.set('top', false);
      this.loading = true;
      playlist.save().then((data) => {
        this.$message.success('成功添加歌曲到播放列表中');
      }).catch((error) => {
        let message;
        switch(error.code) {
          case 137:
            message = '当前歌曲已存在播放列表中';
            break;
          default:
            message = '出现异常错误，请稍后重试！';
        }
        this.$message.error(message);
      }).then(() => {
        this.loading = false;
      });
    },
  },
  computed: {
    shop_music_list() {
      return this.$bus.musicList.list;
    }
  },
  data() {
    return {
      loading: false,
      musicList: [],
    };
  },
};
</script>
