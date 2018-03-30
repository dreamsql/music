<template lang="html">
  <el-card class="box-card"  style="padding-bottom: 141px;">
    <div slot="header">
      <div class="clearfix">
        <span>当前正在播放（共{{musicList.length}}首歌）</span>
        <div class="pull-right">
          <el-switch
            :width="60"
            v-model="autoPlay"
            on-text="自动"
            off-text="手动"
            on-color="#A9A9A9">
          </el-switch>
          <el-button class="top-btn" :title="sortMusicList.length ? '播放下一首歌曲': '没有下一首歌可以播放'" :disabled="musicList.length <= 1" size="small" type="primary" @click="cutMusic">切歌</el-button>
        </div>
      </div>
      <VueAplayer
        ref="aplayer"
        mode="order"
        :music="musicNow"
        :autoplay="false"
        :fold="true"
        :narrow="false"
        @ended="endMusic"
        @canplay="canplayMusic"
        @pause="pauseMusic">
      </VueAplayer>
    </div>
    <div v-if="sortMusicList.length == 0">
      当前列表没有歌曲可以播放
    </div>
    <div class="music-item" v-for="(music, index) in sortMusicList" :key="index">
      <div class="item-info">
        <p>
          <small v-if="music.openId == 'backend'">(后台)</small>{{music.name}}
          <small>-- {{music.type | type}}</small>
        </p>
        <small>{{music.artists | artist}} - {{music.album.name}}</small>
      </div>
      <div class="item-btn" style="width:110px;text-align:right;">
        <el-button size="mini" type="danger" @click="deleteMusic(index)">删除</el-button>
        <el-button v-if="music.top" size="mini" type="warning" @click="topMusic(index, false)">取消置顶</el-button>
        <el-button v-else size="mini" type="primary" @click="topMusic(index, true)" class="top-btn">置顶</el-button>
      </div>
    </div>
  </el-card>
</template>

<script>
import _ from 'lodash';
import VueAplayer from 'vue-aplayer';
import { dataParseJson, sortMusicList } from '@/vendor/project';
import { getMusic } from '@/vendor/music-api';
import { LocalStore as Store } from '@/vendor/store';
import { artistFilter, typeFilter } from '@/vendor/filters';

export default {
  components: {
    VueAplayer,
  },
  filters: {
    artist: artistFilter,
    type: typeFilter,
  },
  computed: {
    // sortMusic指的是继续播放的列表
    // misicList指的是播放的列表加上正在播放的歌曲
    // 针对的是sortMusic进行排序
    sortMusicList() {
      return sortMusicList(this.musicList.slice(1));
    },
  },
  created() {
    this.isMobile = this.judgeMobile();
    this.$bus.getShop().then((shopData) => {
      const query = new this.$database.Query('playlist');
      const shop = this.$database.Object.createWithoutData('shop', shopData.objectId);
      this.database.History = this.$database.Object.extend('history');
      // query.equalTo('status', 0);
      query.equalTo('shop', shop);
      query.find().then((data) => {
        // 排序
        this.musicList = dataParseJson(data);
        // 默认打开页面是自动播放
        this.cutMusic();
        // 第一次切歌的flag
        this.firstCut = true;
      });
      this.bind_live_listen(query);
    });
  },
  mounted() {
    // 添加 audio 组件读取歌曲链接失败处理
    this.$refs.aplayer.control.audio.addEventListener('error', () => {
      this.switchMusic();
    });
  },
  methods: {
    // leancloud live listen
    bind_live_listen(query) {
      query.subscribe().then((liveQuery) => {
        // 用户新点播歌曲时自动添加歌曲到列表
        liveQuery.on('create', (createItem) => {
          const len = this.musicList.length;  
          this.musicList.push(dataParseJson(createItem));
          if(len == 0) {
            // 空列表添加歌曲时自动播放
            !this.isPlaying && this.autoPlay && this.switchMusic();
          }
        });
        liveQuery.on('update', (updateItem) => {
          // 设置置顶状态
          const objectId = updateItem.get('objectId');
          // 改变musicList状态,然后触发排序,重新排序,这时候应该手动排序
          for(let i=0,len=this.musicList.length; i<len; i++) {
            let music = this.musicList[i];
            if (music.objectId == objectId) {
              this.$set(this.musicList, i, dataParseJson(updateItem));
              this.sortMusicList = [this.musicList[0]].concat(sortMusicList(this.musicList.slice(1)));
              return;
            }
          }
        });
        liveQuery.on('delete', (deleteItem) => {
          const objectId = deleteItem.get('objectId');
          // 重置一下列表顺序
          this.musicList = sortMusicList(this.musicList);
          for(let i=0,len=this.musicList.length; i<len; i++) {
            let music = this.musicList[i];
            if (music.objectId == objectId) {
              this.musicList.splice(i, 1);
              return;
            }
          }
        });
      });
    },
    // 判断是否移动端
    judgeMobile() {
      var u = navigator.userAgent;
      return !!u.match(/AppleWebKit.*Mobile.*/) || 
            u.indexOf('Android') > -1 || 
            u.indexOf('Linux') > -1 || 
            u.indexOf('iPad') > -1 || 
            u.indexOf('iPhone') > -1;
    },
    addHistory(index, status = -1) {
      let list;
      if (status == -1) {
        // 删除列表项
        list = this.sortMusicList;
      } else {
        // 切歌
        list = this.musicList;
      }
      const objectId = list[index].objectId;
      const music = this.$database.Object.createWithoutData('playlist', objectId);
      const history = new this.database.History();
      const saveData = _.clone(list[index], true);
      delete saveData.updatedAt;
      delete saveData.createdAt;
      delete saveData.objectId;
      // 删掉正在播放标志
      history.set(saveData);
      history.set('status', status);
      return history.save().then((data) => {
        return music.destroy();
      });
    },
    // 歌曲播放完成监听
    endMusic() {
      // 因网络问题出现的数据库不实时问题，进行歌曲播放统计，
      // 播放完成50首歌曲 自动刷新页面
      if (this.count == 50) {
        location.reload();
      } else {
        this.count++;
      }
      this.isPlaying = false;
      // 切歌
      this.autoPlay && this.switchMusic();
      // 如果是最后一首歌，留在播放列表，不删除
      if (this.sortMusicList.length > 0) {
        this.addHistory(0, 1).then(
          (success) => { }, 
          (error) => {
          console.log('endMusic', error);
        });
      }
    },
    // 暂停歌曲
    pauseMusic() {
      // 移动端自动切歌hack
      if (this.isMobile && this.$refs.aplayer.control.audio.ended) {
        this.cutMusic();
      }
    },
    // 切歌
    cutMusic() {
      if (this.firstCut) {
        this.switchMusic();
        // 歌曲加入历史
        this.addHistory(0, 2).then((success) => {}, (error) => {
          this.$notify.error({
            title: '切歌失败',
            message: `切换歌曲失败`,
            duration: 0
          });
        });
      } else {
        this.switchMusic();
      }
    },
    canplayMusic() {
      console.log('canplay');
    },
    switchMusic() {
      let music;
      // 第一次进来自动切歌,取歌曲列表第一首
      if (!this.firstCut) {
        //  取排序后的歌曲的第一首(第一次进来应该播放所有歌曲的第一首)
        music = sortMusicList(this.musicList)[0];
      } else {
        // 取除了第一首歌后的第一首
        music = this.sortMusicList[0];
      }
      if (!music) {
        this.$notify.warning({
          title: '警告',
          message: '当前没有可播放的歌曲',
          duration: 0
        });
        return;
      } else {
        this.$notify.info('正在切歌');
        // 获取歌曲信息
        getMusic(music.id, music.type).then((data) => {
          this.isPlaying = true;
          this.$refs.aplayer.control.audio.src = data.url;
          this.musicNow = [{
            title: music.name,
            author: artistFilter(music.artists),
            url: data.url,
            pic: music.album.cover,
          }];
          // 设置正在播放的歌曲
          Store.set('music_now', music.objectId);
        }).then(() => {
          console.log('next song')
          this.$refs.aplayer.control.play();
        });
      }
    },
    // 删除歌曲
    deleteMusic(index) {
      this.addHistory(index, -1).then((data) => {
        this.$notify.success({
          title: '删除成功',
          message: `删除歌曲《${this.sortMusicList[index].name}》成功`,
        });
      }, (error) => {
        console.log('deleteMusic', error);
        this.$notify.error({
          title: '删除失败',
          message: `删除歌曲《${this.sortMusicList[index].name}》失败`,
          duration: 0
        });
      });
    },
    // 制定各区
    topMusic(index, top = false) {
      const objectId = this.sortMusicList[index].objectId;
      const music = this.$database.Object.createWithoutData('playlist', objectId);
      // leancloud live会监听到 执行回调刷新歌曲排序
      music.set('top', top);
      music.save().then((success) => {
        console.log('top success', success);
      }, (error) => {
        console.log('top error', error);
      });
    },
  },
  data() {
    return {
      // 由于网络原因有时候会出错，设置一个count，50之后重新刷新页面
      count: 0,
      // 自动播放
      autoPlay: true,
      // 正在播放
      isPlaying: false,
      // 数据库对象
      database: {},
      // 播放列表
      musicList: [{
        name: '不能说的秘密',
        album: '专辑',
        artist: '作者',
      }],
      // 正在播放
      musicNow: [{
        title: 'Preparation',
        author: 'Preparation',
        url: 'http://devtest.qiniudn.com/Preparation.mp3',
        // pic: 'http://devtest.qiniudn.com/Preparation.jpg',
      }],
    };
  },
};
</script>
<style lang="less">
  .aplayer .aplayer-icon.aplayer-icon-mode {
    display: none;
  }
  .music-item {
    font-size: 14px;
    padding: 8px 0;
    border-bottom: 1px solid #eee;
    p {
      margin: 5px 0;
    }
    small {
      color: #999;
    }
  }
  
</style>
