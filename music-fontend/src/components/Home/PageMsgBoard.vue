<template lang="html">
  <div style="padding-bottom:50px;height:100%;overflow:auto;">
    <div class="music-play">
      <div class="music-info">
        <h3>商家<span> -- 留言板（{{boardList.length}}）</span></h3>
      </div>
      <div class="board-publish">
        <field 
          placeholder="请输入评论" 
          type="text" 
          v-model='boardMsg'></field>
        <mt-button 
          size="small" 
          type="default" 
          class="board-publish-btn" 
          @click='publish()'>发布</mt-button>
      </div>
    </div>
    <boardItem
      v-for="(msgItem, index) in boardList"
      :key="index"
      :board="msgItem"
      @reply = 'reply'
      >
    </boardItem>
  </div>
</template>

<script>
import { Field, Button } from 'mint-ui';
import boardItem from '@/components/board-item';
import { LocalStore as Store  } from '@/vendor/store';
import DataBase from '@/vendor/database';
import { saveBoard } from '@/vendor/database-api';
export default {
  props: {
    boardList: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  components: {
    boardItem,
    Field,
    'mt-button': Button
  },
  methods: {
    // 发布评论
      publish() {
        let isReply = !!this.to;
        // 存储评论
        saveBoard(this.boardMsg, isReply, this.reply_openId).then((data) => {
            this.boardMsg = '';
        }).catch(() => {
            alert('评论失败');
            this.boardMsg = '';
        })
      },
      // 点击回复评论的回调
      // to 回复的数据库item id
      // openid 回复的用户
      reply(to, openId) {
        this.to = to;
        this.reply_openId = openId;
        this.boardMsg = `回复${openId}:`;
      }
  },
  data() {
    return {
        boardMsg: ''
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
    .board-publish{
        padding: 10px;
        border: 1px solid;
    }
    .board-publish-btn{
        margin-top: 10px;
        width: 100%;
    }
  }
</style>
