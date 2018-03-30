<template lang="html">
  <div id="app">
    <el-row :gutter="20" style="height:100%;">
      <el-col :span="6" class="music-block">
        <musicSearch></musicSearch>
      </el-col>
      <el-col :span="6" class="music-block">
        <musicPlay></musicPlay>
      </el-col>
      <!--增加商家收藏歌单功能,后台人员才能看到-->
      <el-col :span="6" class="music-block">
        <el-menu
          ref="menu"
          :default-active="activeMenu"
          @select='selectMenu'
          mode="horizontal"
          >
          <el-menu-item index="list">商家歌单</el-menu-item>
          <el-menu-item index="board">留言板</el-menu-item>
        </el-menu>
        <musicBoard v-show="activeMenu=='board'"></musicBoard>
        <musicShopList v-show="activeMenu=='list'"></musicShopList>
      </el-col>
      <el-col :span="6" class="music-block">
        <musicHistory></musicHistory>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import VueAplayer from 'vue-aplayer';
import { dataParseJson } from '@/vendor/project';
import musicSearch from '@/components/Music/Music-search';
import musicHistory from '@/components/Music/Music-history';
import musicPlay from '@/components/Music/Music-play';
// 增加商家收藏歌单功能
import musicShopList from '@/components/Music/Music-shopList';
// 增加商家留言板
import musicBoard from '@/components/Music/Music-board';
import { LocalStore as Store  } from '@/vendor/store';
import { shopAccessList } from '@/config/setting';

export default {
  components: {
    musicPlay,
    musicSearch,
    musicHistory,
    // 增加商家收藏歌单功能
    musicShopList,
    musicBoard
  },
  created() {
    // 获得
    this.$bus.getShop().then((shop) => {
      this.checkShop(shop);
      // 检查是否有歌单,没有就新建一个关联的歌单item
      this.checkMusicList(shop);
    });
  },
  data() {
    return {
      activeMenu: 'list'
    }
  },
  methods: {
    // 切换菜单
    selectMenu(index) {
      this.activeMenu = index;
    },
    // 检查当前有没有关联歌单
    checkMusicList(shop) {
      const query = new this.$database.Query('shop_music_list');
      const curShop = this.$database.Object.createWithoutData('shop', shop.objectId);
      query.equalTo('shop', curShop);
      query.find().then((data) => {
        // 还没有建立与商家关联的歌单
        if (data.length == 0) {
          const NewList = this.$database.Object.extend('shop_music_list');
          const newList = new NewList();
          newList.set('shop', curShop);
          newList.set('list', []);
          newList.save();
        }
      }).catch(() => {
          console.log('出错了');
      })
    },
    // 检查当前商店是否已添加二维码
    checkShop(shop) {
      if (!shop.qrcode) {
        alert('请联系管理员添加该帐号点歌功能');
        window.location.replace('/admin.html');
        return;
      }
    },
  },
};
</script>

<style lang="less">
  html, body, #app {
    height: 100%;
  }
  #app {
    padding: 10px;
    overflow: auto;
    min-width: 1600px;
    .music-block {
      height: 100%;
      overflow: auto;
      .box-card {
        height: 100%;
        .el-card__body {
          height: 100%;
          overflow: auto;
        }
      }
    }
  }
  .top-btn {
    background: #a9a9a9;
    border-color: #a9a9a9;
    color: #fff;
  }
  .top-btn:hover {
    background: #a9a9a9;
  }
</style>
