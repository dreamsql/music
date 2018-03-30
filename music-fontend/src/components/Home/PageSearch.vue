<template>
  <div style="height:100%;padding-top: 90px;padding-bottom: 44px;">
    <div style="width:100%;position:absolute;left:0;top:0;">
      <search
        v-model="search.value"
        ref="search"
      ></search>
      <navbar 
        style="position: absolute;top:44px;left:0;right:0;" 
        class="inline-nav table-fixed" 
        v-model="active">
        <tab-item 
          :id="indexM" 
          v-for="(item, indexM) in searchList" 
          :key="indexM">
          <icon size="16" :type="`music-${item.type}`"></icon>
          <span style="vertical-align:middle">{{item.name}}</span>
        </tab-item>
      </navbar>
    </div>
    <tab-container
      v-model="active"
      style="height:100%;"
      swipeable
      >
      <tab-container-item 
        :id="indexM" 
        v-for="(item, indexM) in searchList" 
        :key="indexM" 
        class="container-item">
        <loadmore
          :top-method="refreshMusic"
          :bottom-method="appendMusic"
          :auto-fill="false"
          :bottom-all-loaded="allLoaded"
          :bottomDistance="30"
          ref="loadmore"
          >
          <music-item 
            @playMusic="playMusic(index)" 
            v-for="(music, index) in searchList[indexM].songsList" 
            :key="index" 
            :music="music" 
            :type="mobileplay">
          </music-item>
        </loadmore>
      </tab-container-item>
    </tab-container>
  </div>
</template>

<script>
import { Loadmore, Search, TabContainer, TabContainerItem, Navbar, TabItem, Toast, Indicator } from 'mint-ui';
import Queue from '@/assets/queue';
import musicItem from '@/components/music-item';
import icon from '@/components/icon';
import Base from '@/vendor/music';
import DataBase from '@/vendor/database';
import { LocalStore } from '@/vendor/store';
import { getMusic } from '@/vendor/music-api';
import { savePlayList } from '@/vendor/database-api';

const netease = new Base('netease', '网易云音乐');
const qq = new Base('qq', 'QQ音乐');
const xiami = new Base('xiami', '虾米音乐');
const queue = new Queue();

export default {
  components: {
    icon,
    Search,
    musicItem,
    Loadmore,
    TabContainer,
    TabContainerItem,
    Navbar,
    TabItem,
  },
  created() {
    this.initMusic();
  },
  watch: {
    'search.value'() {
      // 更换搜索词时情况所有搜索结果列表
      this.searchList.forEach((music) => {
        music.songsList.length = 0;
      });
      this.search.page = 1;
      this.searchMusic(this.search.value);
    },
    active(index) {
      this.allLoaded = false;
      if (this.searchList[index].songsList.length === 0) {
        this.searchMusic(this.search.value);
      }
    },
  },
  props: {
    musicList: Array,
  },
  data() {
    return {
      // 搜索来源
      searchList: [ netease, qq, xiami ],
      allLoaded: false,
      active: undefined,
      search: {
        value: '',
        page: 1,
      },
      // 手机播放的标记(music-item是复用的)
      mobileplay: "mobileplay"
    };
  },
  methods: {
    initMusic(method = 'searchMusic') {
      // 自动search周杰伦
      this[method]('周杰伦').then(() => {
          setTimeout(() => {
            this.active = 0;
          }, 700);
      });
    },
    // 上拉刷新
    refreshMusic() {
      this.searchMusic(this.search.value).then(() => {
        const loadmore = this.$refs.loadmore[this.active];
        loadmore.onTopLoaded();
      });
    },
    // 设置leancloud playlist对象方法
    bind_set_playList(option) {
      let { music, status, openId, shop, qrcode, top} = option;
      playlist.set(music);
      playlist.set(status);
      playlist.set(openId);
      playlist.set(shop);
      playlist.set(qrcode);
      playlist.set(top);
    },
    // 播放歌曲的回调
    playMusic(index) {
      const music = this.searchList[this.active].songsList[index];
      if (music) {
        getMusic(music.id, music.type).then((data) => {
          // 如果因为版权播放不了 success返回false
          if (data.success) {
            // 对象属性
            const option = { music, status: 0, top: false };
            savePlayList(option, () => {
              Indicator.open('正在添加歌曲...');
            }).then((data) => {
                Toast('成功添加歌曲到播放列表中');
            }).catch((error) => {
                let message = '出现异常错误，请稍后重试！';
                Toast(message);
            }).then(() => {
                Indicator.close();
            });
          } else {
            Toast('当前平台由于版权问题暂时无法播放此歌曲，请使用其他音乐平台进行搜索');
          }
        })
      }
    },
    // 无限加载回调方法
    appendMusic() {
      this.search.page++;
      return this.searchMusic(this.search.value, this.search.page, 'append').then(() => {
        const loadmore = this.$refs.loadmore[this.active];
        // 加载完毕
        loadmore.onBottomLoaded();
        return Promise.resolve();
      });
    },
    // 搜索音乐
    searchMusic(search = '', page = 1, type = 'init') {
      const vm = this;
      const index = this.active || 0;
      const key = search.trim();
      return queue.last(() => {
        // 默认使用网易云进行搜索
        return this.searchList[index].searchMusic(key, page, type).then((songsList) => {
          // 无限加载标志（上拉刷新）
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
}
</script>
<style lang="less">
  .inline-nav.mint-navbar {
    display: block;
    white-space: nowrap;
    overflow-y: auto;
    padding: 0 5px;
    .mint-tab-item {
      display: inline-block;
      margin: 0 10px;
    }
    &.table-fixed {
      width: 100%;
      display: table;
      table-layout: fixed;
      .mint-tab-item {
        display: table-cell;
        .mint-tab-item-label {
          font-size: 14px;
        }
      }
    }
  }
  .mint-tab-container-wrap {
    height: 100%;
    .mint-tab-container-item {
      height: 100%;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
      // position: absolute;
      // z-index: 1;
    }
  }
</style>
