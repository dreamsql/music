<template lang="html">
  <div class="music-item">
    <div class="item-info">
      <p>
        {{board.commentFrom}} : 
        <span class="item-album">
            {{board.comment}}
        </span>
      </p>
      <p v-if='!isAdmin && board.to' class='item-commentTo'>
        {{board.to.commentFrom}} : 
        <span class="item-album">
            {{board.to.comment}}
        </span>
      </p>
      <small>
        <template>
          <span class="item-album pull-right" style="font-size:10px;display: flex; justify-content: space-between">
              <span>{{new Date(board.createdAt).toLocaleString()}}</span>
              <span @click='reply'>
                <el-button type="primary"  class="top-btn" size="mini">回复</el-button>
              </span>
              <span v-if='isAdmin'>
                <el-button type="danger" size="mini" @click.native='deleteBoard'>删除</el-button>
              </span>
          </span>
        </template>
      </small>
    </div>
  </div>
</template>

<script>

export default {
  methods: {
      // 调用删除评论的回调
      deleteBoard() {
        this.$emit('deleteBoard', this.board.objectId);
      },
      // 调用回复评论的回调
      reply() {
        const id = this.board.objectId;
        const name = this.board.commentFrom;
        this.$emit('reply', id, name);
      },
  },
  props: {
    // 只有管理用户可以删除评论
    isAdmin: {
      type: Boolean,
      default() {
          return false;
      }
    },
    board: {
      type: Object,
      default() {
        return {};
      },
    },
  },
};
</script>
