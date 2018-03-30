<template lang="html">
  <el-card class="box-card" style="padding-bottom: 73px;" v-loading.body="loading" element-loading-text="拼命加载中">
    <div slot="header">
      <el-input
        placeholder="请输入歌曲名"
        icon="search"
        v-model="search.value"
        >
      </el-input>
    </div>
    <el-tabs v-model="active" type="card" class="music-tab">
      <el-tab-pane
        v-for="(music, indexM) in musicList"
        :label="music.name"
        :key="indexM"
        :name="indexM.toString()"
        >
        <music-item @appendToList="appendToList" @playMusic="playMusic(index)" v-for="(music, index) in musicList[indexM].songsList" :key="index" :music="music" :musicList='shop_music_list'></music-item>
      </el-tab-pane>
    </el-tabs>
  </el-card>
</template>

<script>
import Base from '@/vendor/music';
import musicItem from '@/components/music-item';
import Queue from '@/assets/queue';
import { LocalStore as Store  } from '@/vendor/store';
import { getMusic } from '@/vendor/music-api';
const netease = new Base('netease', '网易云音乐');
const qq = new Base('qq', 'QQ音乐');
const xiami = new Base('xiami', '虾米音乐');

const queue = new Queue();

export default {
  created() {
    const query = new this.$database.Query('shop_music_list');
    query.subscribe().then((liveQuery) => {
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
  },
  components: {
    musicItem,
  },
  mounted() {
    this.initMusic();
  },
  watch: {
    'search.value'() {
      // 更换搜索词时情况所有搜索结果列表
      this.musicList.forEach((music) => {
        music.songsList.length = 0;
      });
      this.search.page = 1;
      this.searchMusic(this.search.value);
    },
    active(index) {
      this.allLoaded = false;
      if (this.musicList[index].songsList.length === 0) {
        this.searchMusic(this.search.value);
      }
    },
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
        // 加入歌曲到歌单
        getMusic(music.id, music.type).then((data) => {
          // 检测歌单版权
          if (data.success) {
            music.index = index;
            curListCld.push(music);
            music_list.set('list', curList);
            music_list.save().then((item) => {
              this.$notify.success({
                title: '添加成功',
                message: `添加歌曲《${music.name}》到歌单成功`,
              });
            });
          } else {
            this.$message.error('当前平台由于版权问题暂时无法播放此歌曲，请使用其他音乐平台进行搜索');
          }
        })
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
    handleClick(index) {
      this.allLoaded = false;
      if (this.musicList[index].songsList.length === 0) {
        this.searchMusic(this.search.value);
      }
    },
    initMusic(method = 'searchMusic') {
      this[method]().then(() => {
        this.active = 1;
      });
    },
    refreshMusic() {
      this.searchMusic(this.search.value).then(() => {
        const loadmore = this.$refs.loadmore[this.active];
        loadmore.onTopLoaded();
      });
    },
    playMusic(index) {
      const music = this.musicList[this.active].songsList[index];
      if (music) {
        getMusic(music.id, music.type).then((data) => {
          if (data.success) {
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
          } else {
            this.$message.error('当前平台由于版权问题暂时无法播放此歌曲，请使用其他音乐平台进行搜索');
          }
        });
      }
    },
    appendMusic() {
      this.search.page++;
      return this.searchMusic(this.search.value, this.search.page, 'append').then(() => {
        const loadmore = this.$refs.loadmore[this.active];
        loadmore.onBottomLoaded();
        return Promise.resolve();
      });
    },
    searchMusic(search = '', page = 1, type = 'init') {
      const vm = this;
      const index = this.active || 0;
      const key = search.trim() || '周杰伦';
      return queue.last(() => {
        return this.musicList[index].searchMusic(key, page, type).then((songsList) => {
          vm.allLoaded = false;
          if (page == 1) {
            const loadmore = this.$refs.loadmore[index];
            loadmore.scrollEventTarget.scrollTop = 0;
          }
        }).catch(() => {
          vm.allLoaded = true;
        });
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
      musicList: [
        netease,
        qq,
        xiami,
      ],
      allLoaded: false,
      active: undefined,
      search: {
        value: '',
        page: 1,
      },
    };
  },
};
</script>

<style lang="less">
  .music-tab .el-tabs__nav {
    display: table;
    table-layout: fixed;
    width: 100%;
    .el-tabs__item {
      display: table-cell;
      text-align: center;
      padding: 0 8px;
    }
  }
</style>
