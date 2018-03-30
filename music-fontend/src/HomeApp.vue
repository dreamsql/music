<template>
  <div id="app">
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="position: absolute; width: 0px; height: 0px; overflow: hidden;"><defs><symbol id="icon-search" viewBox="0 0 32 32"><title>search</title> <path d="M19.427 20.427c-1.39 0.99-3.090 1.573-4.927 1.573-4.694 0-8.5-3.806-8.5-8.5s3.806-8.5 8.5-8.5c4.694 0 8.5 3.806 8.5 8.5 0 1.837-0.583 3.537-1.573 4.927l5.585 5.585c0.55 0.55 0.546 1.431-0 1.976l-0.023 0.023c-0.544 0.544-1.431 0.546-1.976 0l-5.585-5.585zM14.5 20c3.59 0 6.5-2.91 6.5-6.5s-2.91-6.5-6.5-6.5c-3.59 0-6.5 2.91-6.5 6.5s2.91 6.5 6.5 6.5v0z"></path></symbol> <symbol id="icon-queue_music" viewBox="0 0 24 24"><title>queue_music</title> <path d="M17.016 6h4.969v2.016h-3v9c0 1.641-1.359 3-3 3s-3-1.359-3-3 1.359-3 3-3c0.328 0 0.703 0.094 1.031 0.188v-8.203zM3 15.984v-1.969h8.016v1.969h-8.016zM15 9.984v2.016h-12v-2.016h12zM15 6v2.016h-12v-2.016h12z"></path></symbol> <symbol id="icon-bubble2" viewBox="0 0 32 32"><title>bubble2</title> <path d="M16 6c-1.717 0-3.375 0.271-4.928 0.804-1.46 0.502-2.76 1.211-3.863 2.108-2.069 1.681-3.209 3.843-3.209 6.088 0 1.259 0.35 2.481 1.039 3.63 0.711 1.185 1.781 2.268 3.093 3.133 0.949 0.625 1.587 1.623 1.755 2.747 0.056 0.375 0.091 0.753 0.105 1.129 0.233-0.194 0.461-0.401 0.684-0.624 0.755-0.755 1.774-1.172 2.828-1.172 0.168 0 0.336 0.011 0.505 0.032 0.655 0.083 1.325 0.126 1.99 0.126 1.717 0 3.375-0.271 4.928-0.804 1.46-0.502 2.76-1.211 3.863-2.108 2.069-1.681 3.209-3.843 3.209-6.088s-1.14-4.407-3.209-6.088c-1.104-0.897-2.404-1.606-3.863-2.108-1.553-0.534-3.211-0.804-4.928-0.804zM16 2v0c8.837 0 16 5.82 16 13s-7.163 13-16 13c-0.849 0-1.682-0.054-2.495-0.158-3.437 3.437-7.539 4.053-11.505 4.144v-0.841c2.142-1.049 4-2.961 4-5.145 0-0.305-0.024-0.604-0.068-0.897-3.619-2.383-5.932-6.024-5.932-10.103 0-7.18 7.163-13 16-13z"></path></symbol> <symbol id="icon-spinner4" viewBox="0 0 32 32"><title>spinner4</title> <path d="M6 16c0-0.381 0.022-0.756 0.063-1.126l-5.781-1.878c-0.185 0.973-0.283 1.977-0.283 3.004 0 4.601 1.943 8.748 5.052 11.666l3.571-4.916c-1.629-1.779-2.623-4.149-2.623-6.751zM26 16c0 2.602-0.994 4.972-2.623 6.751l3.571 4.916c3.109-2.919 5.052-7.065 5.052-11.666 0-1.027-0.098-2.031-0.283-3.004l-5.781 1.878c0.041 0.37 0.063 0.745 0.063 1.126zM18 6.2c2.873 0.583 5.298 2.398 6.702 4.87l5.781-1.878c-2.287-4.857-6.945-8.377-12.482-9.067v6.076zM7.298 11.070c1.403-2.471 3.829-4.286 6.702-4.87v-6.076c-5.537 0.691-10.195 4.21-12.482 9.067l5.78 1.878zM20.142 25.104c-1.262 0.575-2.665 0.896-4.142 0.896s-2.88-0.321-4.142-0.896l-3.572 4.916c2.288 1.261 4.917 1.98 7.714 1.98s5.426-0.719 7.714-1.98l-3.572-4.916z"></path></symbol></defs></svg>
    <transition name="fade">
      <keep-alive>
        <router-view :musicList="sortMusicList" :boardList="boardList"></router-view>
      </keep-alive>
    </transition>
    <tabbar v-if="!$route.meta.single" class="footer" v-model="active">
      <tab-item id="list">
        <router-link to="/list">
          <svg class="icon icon-queue_music"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon-queue_music"></use></svg>
          <span class="tab-name">列表</span>
        </router-link>
      </tab-item>
      <tab-item id="search">
        <router-link to="/search">
          <svg class="icon icon-search"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon-search"></use></svg>
          <span class="tab-name">搜索</span>
        </router-link>
      </tab-item>
      <tab-item id="msgboard">
        <router-link to="/msgboard">
        <svg class="icon icon-bubble2"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon-bubble2"></use></svg>
          <span class="tab-name">留言板</span>
        </router-link>
      </tab-item>
      <!-- <tab-item id="user">
        <router-link to="/user">
          <icon type="user" title="用户中心"></icon>
          <span class="tab-name">个人</span>
        </router-link>
      </tab-item> -->
    </tabbar>
  </div>
</template>

<script>
import 'mint-ui/lib/style.css';
import DataBase from '@/vendor/database';
import icon from '@/components/icon';
import { LocalStore as Store } from '@/vendor/store';
import { dataParseJson, sortMusicList } from '@/vendor/project';
import { Tabbar, TabItem } from 'mint-ui';

export default {
  name: 'app',
  components: {
    Tabbar,
    TabItem,
    icon,
  },
  created() {
    const query = new DataBase.Query('playlist');
    const board_query = new DataBase.Query('board_list');
    const qrcode_query = new DataBase.Query('qrcode');
    const shopId = Store.get('music_user').shopId;
    query.equalTo('shop', DataBase.Object.createWithoutData('shop', shopId));
    board_query.include('to');
    board_query.equalTo('shop', DataBase.Object.createWithoutData('shop', shopId));
    qrcode_query.equalTo('shop', DataBase.Object.createWithoutData('shop', shopId));
    query.find().then((data) => {
      this.musicList = dataParseJson(data);
    });
    // 降序排列
    board_query.descending('createdAt');
    board_query.find().then((data) => {
      this.boardList = dataParseJson(data);
    });
    qrcode_query.first().then((data) => {
      data.increment('scan_count', 1);
      return data.save();
    }).then((result) => {
      console.log('success')
    })
    query.subscribe().then((liveQuery) => {
      // 用户新点播歌曲时自动添加歌曲到列表
      liveQuery.on('create', (createItem) => {
        this.musicList.push(dataParseJson(createItem));
      });
      liveQuery.on('update', (updateItem) => {
        const objectId = updateItem.get('objectId');
        for(let i=0,len=this.musicList.length; i<len; i++) {
          let music = this.musicList[i];
          if (music.objectId == objectId) {
            // this.$set(this.musicList, i, dataParseJson(updateItem));
            this.musicList.splice(i, 1, dataParseJson(updateItem));
            this.sortMusicList = [this.musicList[0]].concat(sortMusicList(this.musicList.slice(1)));
            return;
          }
        }
      });
      liveQuery.on('delete', (deleteItem) => {
        const objectId = deleteItem.get('objectId');
        // 重置一下列表顺序
        // this.musicList = [this.musicList[0]].concat(this.sortMusicList);
        for(let i=0,len=this.musicList.length; i<len; i++) {
          let music = this.musicList[i];
          if (music.objectId == objectId) {
            this.musicList.splice(i, 1);
            return;
          }
        }
      });
    });
    board_query.subscribe().then((liveQuery) => {
      // 用户新点播歌曲时自动添加歌曲到列表
      liveQuery.on('create', (createItem) => {
        const create = dataParseJson(createItem);
        // 关联查询回复的评论
        if (create.to) {
          const query = new DataBase.Query('board_list');
          query.get(create.to.objectId).then((data) => {
            create.to = dataParseJson(data);
            this.boardList.unshift(create);
          })
        } else {
          this.boardList.unshift(create);
        }
      });
      liveQuery.on('delete', (deleteItem) => {
        const objectId = deleteItem.get('objectId');
        for(let i=0,len=this.boardList.length; i<len; i++) {
          let music = this.boardList[i];
          if (music.objectId == objectId) {
            this.boardList.splice(i, 1);
            return;
          }
        }
      });
    });
  },
  computed: {
    sortMusicList() {
      // 直接排序 保持前后台同步
      // 判断第一首歌是不是后台歌曲
      // if (this.musicList[0].openId == 'backend') {
      //   return [this.musicList[0]].concat(sortMusicList(this.musicList.slice(1)));
      // } else {
        
        this.musicList[0] && Store.set('music_now', this.musicList[0].objectId);
        return sortMusicList(this.musicList);
      // }
    },
    active: {
      get() {
        return this.$route.name;
      },
      set(v) {
        // this.active = v;
      }
    },
  },
  data() {
    return {
      boardList: [],
      musicList: [{
        name: '不能说的秘密',
        album: {},
        artists: [],
      }],
    };
  },
}
</script>

<style lang="less">
* {
  box-sizing: border-box;
}
body {
  background-color: #fbf9fe;
}
html, body,#app {
  height: 100%;
  width: 100%;
  margin: 0;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
}
.text-center {
  text-align: center;
}
.add-more {
  text-align: center;
  padding: 10px;
}
.footer.mint-tabbar {
  border-top: 1px solid #ddd;
   &> .mint-tab-item.is-selected {
     background-color: inherit;
   }
   .mint-tab-item {
     padding: 0;
   }
  .mint-tab-item-label {
    line-height: 30px;
    font-size: 14px;
    .tab-name {
      vertical-align: middle;
    }
    a {
      text-decoration: none;
      color: inherit;
      padding: 7px 0;
      display: block;
    }
  }
}
.wrap{
  display: flex;
  -webkit-box-orient: vertical;
  flex-direction: column;
  width:100%;
  height:100%;
}
.main{
  flex:1;
  width:100%;
}
</style>
