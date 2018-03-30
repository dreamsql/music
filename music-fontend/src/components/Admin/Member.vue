<template lang="html">
  <div class="">
    <el-table
      :data="tableData"
      border
      style="width: 100%"
      >
      <el-table-column
        prop="openId"
        label="会员微信名"
        >
      </el-table-column>
      <el-table-column
        prop="qrcode.name"
        label="注册的二维码"
        >
      </el-table-column>
      <el-table-column
        prop="shop.name"
        label="所属店面">
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { LocalStore as Store  } from '@/vendor/store';
import { formMixin } from '@/vendor/mixins';

export default {
  mixins: [formMixin],
  created() {
    this.database.query = new this.$database.Query('music_user');
    const adminUser = Store.get('admin_user');
    const shopList = [];
    adminUser.shop.forEach((shop) => {
      shopList.push(this.$database.Object.createWithoutData('shop', shop.objectId));
    });
    this.database.query.containedIn('shop', shopList);
    this.database.query.include('qrcode', 'shop');
    this.getPageData();
  },
  data() {
    return {
    }
  }
};
</script>
