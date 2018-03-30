<template lang="html">
  <div class="">
    <el-button type="primary" @click="showEdit()" v-show="tableData.length>1">添加二维码</el-button>
    <br>
    <br>
    <el-table
      :data="tableData"
      empty-text="无"
      border
      style="width: 100%"
      >
      <!-- <el-table-column
        prop="date"
        label="店面名称"
        width="180">
      </el-table-column> -->
      <el-table-column
        type="index"
        width="50"
        align="center"
        >
      </el-table-column>
      <el-table-column
        prop="name"
        label="名称"
        :formatter="defaultTable"
        align="center"
        >
      </el-table-column>
      <el-table-column
        prop="shop.name"
        label="店面"
        align="center"
        >
      </el-table-column>
      <el-table-column
        prop="objectId"
        label="二维码"
        align="center"
        >
        <template scope="scope">
          <el-tooltip effect="light" placement="right">
            <div slot="content">
              <qriously :value="$project.getAuthorizeURL(`${baseUrl}/#/?sId=${scope.row.shop.objectId}&qId=${scope.row.objectId}`)" :size="200" />
            </div>
            <!--改变value为授权登录页面-->
            <!-- <el-button>查看二维码</el-button> -->
            <div style="display:inline-block;cursor:pointer;" :data-url="$project.getAuthorizeURL(`${baseUrl}/#/?sId=${scope.row.shop.objectId}&qId=${scope.row.objectId}`)">
              <qriously :value="$project.getAuthorizeURL(`${baseUrl}/#/?sId=${scope.row.shop.objectId}&qId=${scope.row.objectId}`)" :size="20" />
            </div>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column
        prop="scan_count"
        label="被扫描次数"
        align="center"
        >
      </el-table-column>
      <el-table-column
        prop="createdAt"
        label="创建时间"
        width="180"
        :formatter="convertDate"
        align="center"
        >
      </el-table-column>
      <el-table-column
        prop="remark"
        label="备注"
        show-overflow-tooltip
        >
      </el-table-column>
      <el-table-column label="编辑" align="center">
        <template scope="scope">
          <el-button
            size="small"
            @click="showEdit(scope.row.objectId)"
            >
            编辑
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog title="二维码操作" :visible.sync="dialogFormVisible" @open="getShopList" @close="resetForm">
      <el-form :model="ruleForm" :rules="rules" label-width="120px" ref="ruleForm">
        <el-form-item label="二维码名称" prop="name">
          <el-input v-model="ruleForm.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="所属店面" prop="shop">
          <el-select v-model="ruleForm.shop" placeholder="请选择二维码所属店面" clearable :disabled="shopIds.length == 1 || !!ruleForm.objectId">
            <el-option
              v-for="(shop, index) in shopList"
              :label="shop.name"
              :value="shop.objectId"
              :key="index"
              ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input type="textarea" autosize :rows="2" v-model="ruleForm.remark" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveData()">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash';
import Vue from 'vue';
import VueQriously from 'vue-qriously';
import { formMixin } from '@/vendor/mixins';
import { LocalStore as Store  } from '@/vendor/store';

Vue.use(VueQriously);

export default {
  mixins: [formMixin],
  created() {
    // 菜单切换
    this.$emit('changeMenu', 'qrcode');
    // 定义数据库对象
    this.database.query = new this.$database.Query('qrcode');
    this.database.Database = this.$database.Object.extend('qrcode');
    // 查看的是具体某个店的二维码(super用户功能) 一家店只能有一个二维码
    this.ruleForm.shop = this.$route.query.id;
    if (this.ruleForm.shop) {
      this.shopIds.push(this.ruleForm.shop);
    } else {
      // 查看这个用户下管理的所有店的二维码
      const adminUser = Store.get('admin_user');
      adminUser.shop.forEach((shop) => {
        this.shopIds.push(shop.objectId);
      });
      if (this.shopIds.length === 1) {
        this.ruleForm.shop = this.shopIds[0];
      }
    }
    this.getPageData();
  },
  methods: {
    // 编辑二维码
    showEdit(id) {
      if (id) {
        this.database.query.get(id).then((data) => {
          const qrcode = this.$project.dataParseJson(data);
          this.ruleForm.objectId = qrcode.objectId;
          this.ruleForm.name = qrcode.name;
          this.ruleForm.remark = qrcode.remark;
          this.ruleForm.shop = qrcode.shop.objectId;
        });
      }
      this.dialogFormVisible = true;
    },
    // 打开窗口的操作
    getShopList() {
      this.$bus.getShopList().then((data) => {
        this.shopList = this.$project.dataParseJson(data);
      });
    },
    saveData(formName = 'ruleForm') {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          let database;
          let shop_database;
          if (this.ruleForm.objectId) {
            // 编辑状态
            database = this.$database.Object.createWithoutData('qrcode', this.ruleForm.objectId);
          } else {
            database = new this.database.Database();
          }
          const saveData = _.clone(this.ruleForm, true);
          // 拿到shop的信息
          shop_database = this.$database.Object.createWithoutData('shop', this.ruleForm.shop);
          saveData.shop = shop_database;
          delete saveData.objectId;
          database.set(saveData);
          database.save().then((data) => {
            // 在shop数据表里面加入qrcode列数据 music页检测shop中的qrcode字段
            let qrcode = this.$database.Object.createWithoutData('qrcode', data.id);
            shop_database.set('qrcode', qrcode);
            shop_database.save().then(data2 => {
              this.dialogFormVisible = false;
              this.getPageData();
            })
          });
        } else {
          this.$message({
            message: '表单验证有误',
            type: 'warning'
          });
        }
      });
    },
    getPageData() {
      const shopList = [];
      // 如果不是查看商店的二维码,则显示用户管理所有商店的二维码
      if (this.shopIds.length) {
        this.shopIds.forEach((id) => {
          shopList.push(this.$database.Object.createWithoutData('shop', id))
        });
        this.database.query.containedIn('shop', shopList);
      }
      this.database.query.include('shop');
      this.database.query.find().then((data) => {
        this.tableData = this.$project.dataParseJson(data);
      });
    },
  },
  data() {
    return {
      // 转到的地址，需要改
      baseUrl: window.location.origin,
      shopIds: [],
      shopList: [],
      ruleForm: {
        objectId: '',
        name: '',
        shop: '',
        remark: '',
        scan_count: 0
      },
      rules: {
        name: [
          {
            required: true,
            message: '请输入二维码的名称',
            trigger: 'change'
          },
        ],
        shop: [
          {
            required: true,
            message: '请选择二维码所属的店面',
            trigger: 'change'
          },
        ],
      }
    }
  }
};
</script>
