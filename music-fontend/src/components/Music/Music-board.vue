<template lang="html">
  <el-card class="box-card" style="padding-bottom: 55px;">
    <div slot="header">
      <p>商家留言板（{{boardList.length}})</p>
    </div>
    <board-item 
        v-for="(msgItem, index) in boardList"
        :key="index"
        :board="msgItem"
        :isAdmin='isAdmin'
        @deleteBoard='deleteBoard'
        @reply='reply'
    >
    </board-item>
    <el-dialog
        :visible.sync="dialogVisible"
        size="tiny">
      <span slot='title'>{{dialogTitle}}</span>
      <el-input v-model="comment" placeholder="请输入内容"></el-input>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveMsg()">确 定</el-button>
      </span>
    </el-dialog>
  </el-card>
</template>

<script>
import _ from 'lodash';
import { dataParseJson } from '@/vendor/project';
import boardItem from '@/components/board-item';
import { LocalStore as Store } from '@/vendor/store';
import DataBase from '@/vendor/database';
import { saveBoardList } from '@/vendor/database-api';

export default {
  components: {
    boardItem,
  },
  created() {
    this.$bus.getShop().then((shopData) => {
      const query = new this.$database.Query('board_list');
      // 定义当前商店
      this.shop = this.$database.Object.createWithoutData('shop', shopData.objectId);
      query.descending('createdAt');
      query.equalTo('shop', this.shop);
      query.find().then((data) => {
        this.boardList = dataParseJson(data);
      });
      this.bind_live_listen(query);
    });
  },
  methods: {
    // leancloud live listen
    bind_live_listen(query) {
      query.subscribe().then((liveQuery) => {
        liveQuery.on('create', (createItem) => {
          this.boardList.unshift(dataParseJson(createItem));
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
    // 回复评论
    reply(to, openId) {
      // 回复对象
      this.to = to;
      // 回复对象的openid
      this.openId = openId;
      this.dialogVisible = true;
      this.dialogTitle = `回复${openId}:`;
    },
    // 确认回复
    saveMsg() {
      const option = { 
        shop: this.shop, 
        toId: this.to, 
        comment: this.comment
      };
      // 存储回复评论
      saveBoardList(option).then((data) => {
          this.dialogVisible = false;
          this.comment = '';
      }).catch(() => {
          alert('评论失败');
          this.comment = '';
          this.dialogVisible = false;
      })
    },
    // 删除评论
    deleteBoard(id) {
      console.log(id);
			this.$confirm('确认删除评论', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}).then(() => {
				const board = this.$database.Object.createWithoutData('board_list', id);
				board.destroy();
			}).catch(() => {     
				this.$message.error('删除评论失败');
			});   
    },
  },
  data() {
    return {
      isAdmin: true,
      loading: false,
      boardList: [],
      dialogVisible: false,
      msgId: '',
      comment: '',
      dialogTitle: ''
    };
  },
};
</script>
