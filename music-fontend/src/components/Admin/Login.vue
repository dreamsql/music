<template lang="html">
  <div class="" @keyup.enter="login">
    <el-dialog
      :visible="true"
      :show-close="false"
      size="full"
      >
      <br>
      <br>
      <br>
      <br>
      <el-card class="box-card" style="width: 500px;margin:auto;">
        <div slot="header" class="clearfix">
          <h3 style="line-height: 36px;text-align:center">来点音乐-后台登录</h3>
        </div>
        <el-form :model="form" label-width="120px" :rule="rule">
          <el-form-item label="用户帐号" >
            <el-input v-model="form.account" placeholder="请输入邮箱帐号" auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="登录密码">
            <el-input type="password" v-model="form.password" placeholder="请输入密码" auto-complete="off"></el-input>
          </el-form-item>
        </el-form>
        <div class="" style="text-align:center;">
          <el-button type="primary" @click="login">登录</el-button>
        </div>
      </el-card>
    </el-dialog>
  </div>
</template>

<script>
import { LocalStore as Store  } from '@/vendor/store';
import { isSuper } from '@/vendor/util';
export default {
  data() {
    return {
      form: {
        account: '',
        password: '',
      },
      rule: {
        account: [
          {
            required: true,
            message: '请输入用户帐号',
            type: 'email',
            trigger: 'change'
          },
        ],
        password: [
          {
            required: true,
            message: '请输入登录密码',
            trigger: 'change'
          },
        ],
      },
    };
  },
  methods: {
    login() {
      // leanCloud登录
      this.$database.User.logIn(this.form.account, this.form.password).then((loginedUser) => {
        const query = new this.$database.Query('admin_user');
        query.equalTo('user', loginedUser);
        return query.first().then((user) => {
          if (!user) {
            return Promise.reject({
              code: -1,
              message: '帐号已被删除',
            });
          }
          this.$message.success('登录成功');
          const adminUser = user.toJSON();
          let is_super = isSuper(adminUser);
          // 设置全局变量
          Store.set('admin_user', adminUser);
          // 登录回调(设置用户的super权限)
          this.$emit('loginCb', is_super);
          // root用户默认调到shop页面
          // 普通用户跳qrcode页面
          this.$router.replace(`${is_super ? '/shop' : '/qrcode'}`);
        });
      }).catch((error) => {
        switch (error.code) {
          case 211:
          case 210:
            this.$message.error('帐号或密码错误');
            break;
          case -1:
            this.$message.error(error.message);
            break;
          default:
            this.$message.error('出现异常错误，请联系网站管理员');
        }
      });
    },
  },
};
</script>
