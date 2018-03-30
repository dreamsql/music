<template lang="html">
    <el-card class="box-card" style="padding-bottom: 55px;">
      <div slot="header">
        <div class="clearfix">
          <span>收藏歌单</span>
          <div class="pull-right">
          <el-button size="small" type="primary" @click="addList" class="top-btn">添加歌单</el-button>
          </div>
        </div>
      </div>
      <el-tree 
        :data="musicList"
        accordion
        :render-content="renderContent" 
        :props="defaultProps" 
        node-key="id"
        @node-click="handleNodeClick" 
        style="border: 0;">
      </el-tree>
      <el-dialog
        :visible.sync="dialogVisible"
        size="tiny"
        :before-close="handleClose">
        <span slot='title'>{{dialogTitle}}</span>
        <el-input v-model="list.name" placeholder="请输入内容" v-show='!isAddList'></el-input>
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="saveList()">确 定</el-button>
        </span>
      </el-dialog>
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
    this.$bus.getShop().then((shopData) => {
      const query = new this.$database.Query('shop_music_list');
      this.shop = this.$database.Object.createWithoutData('shop', shopData.objectId);
      query.descending('createdAt');
      query.equalTo('shop', this.shop);
      query.find().then((data) => {
        const shop_music_list_msg = dataParseJson(data)[0];
        // 歌单列表
        this.musicList = shop_music_list_msg.list;
        this.$bus.musicList = shop_music_list_msg;
      });
      this.bind_live_listen(query);
    });
  },
  methods: {
    // leancloud live listen
    bind_live_listen(query) {
      query.subscribe().then((liveQuery) => {
        liveQuery.on('create', (createItem) => {
          this.musicList.unshift(dataParseJson(createItem));
          (this.musicList.length > 100) && (this.musicList.length = 100);
        });
        liveQuery.on('update', (updateItem) => {
          const list = updateItem.get('list');
          this.musicList = list;
        });
      });
    },
    // 自定义树渲染函数
    renderContent(h, { node, data, store }) {
      return (
        <span>
          <span>
            <span>{node.label}</span>
          </span>
          <span style="float: right; margin-right: 20px">
            <el-button size="mini" type='danger' on-click={ () => this.deleteFromList(store, data, data.index) }>删除</el-button>
            <el-button size="mini" class="top-btn" on-click={ () => this.appendToList(store, data) }>播放</el-button>
          </span>
        </span>
      );
    },
    // 删除歌单/歌曲
    deleteFromList(store, data, index) {
      let confirmMsg = data.children? '删除歌单': '删除歌曲';
      this.$confirm(confirmMsg, '提示', {
        confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}).then(() => {
        // 获得歌单的objectId 查询数据库用
        const music_list_id = this.$bus.musicList.objectId;
        const query = new this.$database.Query('shop_music_list');
        query.get(music_list_id).then((shopPlayList) => {
          const curList = shopPlayList.get('list');
          let newList = curList.slice();
          // 删除子菜单和里面的歌曲
          if (data.children) {
            newList.splice(index, 1);
            shopPlayList.set('list', newList);
          } else {
            // 删除菜单中的歌曲
            newList[index].children = newList[index].children.filter((item) => {
              return item.id !== data.id;
            })
            shopPlayList.set('list', newList);
          }
          shopPlayList.save().then((item) => {
            this.$notify.success({
              title: '删除成功',
              message: `删除歌单成功`,
            });
          }).catch(() =>{
            this.$notify.error({
              title: '删除失败',
              message: `删除歌单失败`,
            });
          })
        });   
			}).catch(() => {     
				this.$message.error('删除歌单失败');
      })
    },
    // 商家歌单加入播放列表
    appendToList(store, data) {
      let playlist;
      const Playlist = this.$database.Object.extend('playlist');
      const shopData = Store.get('shop');
      const shop = this.$database.Object.createWithoutData('shop', shopData.objectId);
      const qrcode = this.$database.Object.createWithoutData('qrcode', shopData.qrcode.objectId);
      // 点击歌单,全部导入播放列表
      if (data.children) {
        const playlists = [];
        data.children.forEach((item) => {
          // 删除多余的属性
          delete item.objectId;
          delete item.createdAt;
          delete item.updatedAt;
          delete item.order;
          delete item.status;
          delete item.openId;
          delete item.shop;
          delete item.qrcode;
          delete item.top;
          // 新建列表对象
          playlist = new Playlist();
          playlist.set(item);
          playlist.set('status', 0);
          playlist.set('openId', 'backend');
          playlist.set('shop', shop);
          playlist.set('qrcode', qrcode);
          playlist.set('top', false);
          playlists.push(playlist);
        }) 
        this.$database.Object.saveAll(playlists).then((data) => {
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
        })
      } else {
        playlist = new Playlist();
        // 删除多余属性
        delete data.createdAt;
        delete data.updatedAt;
        playlist.set(data);
        playlist.set('status', 0);
        playlist.set('openId', 'backend');
        playlist.set('shop', shop);
        playlist.set('qrcode', qrcode);
        playlist.set('top', false);
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
        })
      }
    },
    // 添加歌单
    addList() {
      this.dialogVisible = true;
      this.dialogTitle = '请输入歌单名字';
    },
    // 检测歌单是否存在
    bind_check_listUnique(list, listDiff) {
      // 检测歌单名称是否重复
        list.forEach((item) => {
          if (item.name == newItem.name) {
            throw {
              code: 137
            };
          }
        })
    },
    // 新增歌单
    saveList(done) {
      // 新增歌单,获取原本歌单,push
      const music_list_id = this.$bus.musicList.objectId;
      const query = new this.$database.Query('shop_music_list');
      query.get(music_list_id).then((music_list) => {
        const curList = music_list.get('list');
        const newItem = { index: curList.length, name: this.list.name, children: [] };
        // 检测歌单名称是否重复,如果重复了,抛出错误
        this.bind_check_listUnique(curList, newItem);
        // 加入新歌单到歌单
        curList.push(newItem);
        music_list.set('list', curList);
        music_list.save().then((item) => {
          this.$notify.success({
            title: '添加成功',
            message: `添加新歌单${this.list.name}`,
          });
        });
      }).catch((error) => {
        let message;
        switch(error.code) {
          case 137:
            message = '歌单已存在';
            break;
          default:
            message = '出现异常错误，请稍后重试！';
        }
        this.$message.error(message);
      }).then(() => {
        this.dialogVisible = false;
        this.list.name = '';
      });
    },
    // 关闭窗口
    handleClose() {
      this.dialogVisible = false;
    },
    // 点击菜单回调
    handleNodeClick(data) {
      // console.log(data);
    }
  },
  data() {
    return {
      // 对话框触发
      dialogTitle: '',
      dialogVisible: false,
      // 新增歌单信息
      list: { name: '' },
      // 显示新增操作
      isAddList: false,
      loading: false,
      // 歌单列表
      musicList: [],
      defaultProps: {
        index: 'index',
        children: 'children',
        label: 'name'
      }
    };
  },
};
</script>
