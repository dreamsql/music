<template>
  <div id="app">
    <el-menu
      ref="menu"
      theme="dark"
      :default-active="activeMenu"
      class="el-menu-demo"
      mode="horizontal"
      :router="true"
      >
      <el-menu-item index="shop" v-if="is_super">店面管理</el-menu-item>
      <el-menu-item index="qrcode">二维码管理</el-menu-item>
      <el-menu-item index="member">会员管理</el-menu-item>
      <el-menu-item index="level" v-if="is_super">会员设置</el-menu-item>
      <el-menu-item index="admin" v-if="is_super">后台用户管理</el-menu-item>
      <el-menu-item index="history">点歌历史</el-menu-item>
      <el-submenu index="sign" style="float:right;margin-right:20px;">
        <template slot="title">{{ ($bus.adminUser && $bus.adminUser.remark) || '商家用户'}}</template>
        <el-menu-item index="logout" :route="{path: '/'}" @click.native="logout">退出登录</el-menu-item>
      </el-submenu>
      <a class="el-menu-item" style="float:right;" href="/music.html" target="_blank">
        <icon type="play"></icon>
      </a>
    </el-menu>
    <br>
    <el-row>
      <el-col :offset="2" :span="20">
        <router-view @changeMenu="changeMenu" @loginCb='bind_get_isSuper'></router-view>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import icon from '@/components/icon';
import { LocalStore as Store  } from '@/vendor/store';
import { isSuper } from '@/vendor/util';

export default {
	components: {
		icon,
	},
	created() {
		// 设置全局admin_user
		const adminUser = Store.get('admin_user');
		this.$bus.adminUser = adminUser;
		if (adminUser) {
			let status = isSuper(this.$bus.adminUser);
			this.bind_get_isSuper(status);
		} else {
			this.bind_route_logout();
		}
  	},
	methods: {
		bind_get_isSuper(status) {
			// 定义页面的超级用户状态
			this.is_super = status;
			// root默认显示店面管理
			if(this.is_super) {
				this.activeMenu = 'shop';
				this.$router.replace({ name: 'shop' });
			} else {
				this.activeMenu = 'qrcode';
				this.$router.replace({ name: 'qrcode' });
			}
		},
		// 替换当前url
		bind_route_logout() {
			this.is_super = false;
			this.$router.replace({
				name: 'login',
				params: {
					force: true,
					path: this.$route.fullPath
				},
			});
		},
		// 设置当前active的回调
		changeMenu(key) {
			this.activeMenu = key;
		},
		logout() {
			this.$database.User.logOut();
			this.$message.success('退出登录成功');
			Store.clearAll();
			this.$emit('changeMenu', '');
			this.bind_route_logout();
		}
	},
	data() {
		return {
			activeMenu: '',
			// 判断是不是超级用户(root)
			is_super: false,
		};
	},
}
</script>
