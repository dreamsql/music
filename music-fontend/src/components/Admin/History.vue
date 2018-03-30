<template lang="html">
  <div class="">
    <el-table
      :data="tableData"
      border
      style="width: 100%"
      >
      <el-table-column
        prop="name"
        label="歌曲名"
        width="180">
      </el-table-column>
      <el-table-column
        prop="type"
        :formatter="convertType"
        label="音乐平台">
      </el-table-column>
      <el-table-column
        prop="artists"
        :formatter="convertArtist"
        label="歌手">
      </el-table-column>
      <el-table-column
        prop="album.name"
        label="专辑">
      </el-table-column>
      <el-table-column
        prop="shop.name"
        label="所属店面">
      </el-table-column>
      <el-table-column
        prop="qrcode.name"
        label="所属二维码">
      </el-table-column>
      <el-table-column
        prop="createdAt"
        :formatter="convertDate"
        label="点歌时间">
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { formMixin } from '@/vendor/mixins';
import { LocalStore as Store  } from '@/vendor/store';
import { typeFilter, artistFilter } from '@/vendor/filters';

export default {
  mixins: [formMixin],
  created() {
    this.database.query = new this.$database.Query('history');
    const adminUser = Store.get('admin_user');
    const shopList = [];
    adminUser.shop.forEach((shop) => {
      shopList.push(this.$database.Object.createWithoutData('shop', shop.objectId));
    });
    this.database.query.include('shop');
    this.database.query.include('qrcode');
    this.database.query.containedIn('shop', shopList);
    this.database.query.descending('createdAt');
    this.getPageData();
  },
  methods: {
    convertType(row, column) {
      return typeFilter(row[column.property]);
    },
    convertArtist(row, column) {
      return artistFilter(row[column.property]);
    },
  },
  data() {
    return {
      tableData: [],
    };
  },
};
</script>
