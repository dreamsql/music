<template lang="html">
  <div class="">
    <el-button 
      type="primary" 
      @click="showEdit()">
      添加店面
    </el-button>
    <br>
    <br>
    <el-table
      :data="tableData"
      empty-text="无"
      border
      style="width: 100%">
      <el-table-column
        type="index"
        width="50">
      </el-table-column>
      <el-table-column
        prop="name"
        label="店面名称"
        width="180">
      </el-table-column>
      <el-table-column
        prop="address"
        label="店面地址">
      </el-table-column>
      <el-table-column
        label="查看店面二维码">
        <template scope="scope">
          <router-link :to="{path: '/qrcode', query: {id: scope.row.objectId}}">
            <el-button type="text">查看二维码</el-button>
          </router-link>
        </template>
      </el-table-column>
      <el-table-column label="编辑" align="center">
        <template scope="scope">
          <el-button
            size="small"
            @click="showEdit(scope.row.objectId)">
            编辑
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog title="店面操作" :visible.sync="dialogFormVisible" @close="resetForm">
      <el-form :model="ruleForm" :rules="rules" label-width="120px" ref="ruleForm">
        <el-form-item label="店面名称" prop="name">
          <el-input v-model="ruleForm.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="店面地址" prop="address">
          <el-input v-model="ruleForm.address" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item v-if="ruleForm.objectId" label="店面二维码" prop="qrcode">
          <el-select v-model="ruleForm.qrcode" placeholder="请选择店面绑定的二维码" clearable>
            <el-option
              v-for="(qrcode, index) in qrcodeList"
              :label="`${qrcode.name}--${qrcode.remark}`"
              :value="qrcode.objectId"
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
import { formMixin } from '@/vendor/mixins';
import { LocalStore as Store  } from '@/vendor/store';

// 管理权限用户进入的逻辑
export default {
  mixins: [formMixin],
  created() {
    // 改变active菜单
    this.$emit('changeMenu', 'shop');
    // 获得用户id
    this.adminUserId = Store.get('admin_user').objectId;
    // 定义leancloud查询对象
    this.database.query  = new this.$database.Query('shop');
    this.database.Database = this.$database.Object.extend('shop');
    // 搜索shop列表找到和对应用户管理相应的list
    this.updateShopList(this.adminUserId);
  },
  methods: {
    // 获得对应用户的shop列表
    updateShopList(id) {
      const shopList = [];
      const adminQuery  = new this.$database.Query('admin_user');
      adminQuery.get(id).then((data) => {
        const adminShopList = data.get('shop');
        // 获得这个用户下管理的门店的id
        adminShopList.forEach((shop) => {
          shopList.push(shop.get('objectId'));
        });
        // leancloud查询方法
        this.database.query.containedIn('objectId', shopList);
        // 拿到关联商家的信息（mixin的方法）
        this.getPageData();
      })
    },
    /*
    * id 商店id
     */
    showEdit(id) {
      if (id) {
        this.database.query.get(id).then((data) => {
          const shop = this.$project.dataParseJson(data);
          this.ruleForm.objectId = shop.objectId;
          this.ruleForm.name = shop.name;
          this.ruleForm.address = shop.address;
          this.ruleForm.remark = shop.remark;
          this.ruleForm.qrcode = shop.qrcode.objectId;
        });
        this.getQrcodeList(id);
      }
      this.dialogFormVisible = true;
    },
    // 获取二维码列表
    getQrcodeList(shopId) {
      this.$bus.getQrcodeList(shopId).then((data) => {
        this.qrcodeList = this.$project.dataParseJson(data);
      });
    },
    // 保存信息
    saveData(formName = 'ruleForm') {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          let database;
          // 关联的用户也要添加店面
          let adminDatabase;
          if (this.ruleForm.objectId) {
            // 编辑原来的信息
            database = this.$database.Object.createWithoutData('shop', this.ruleForm.objectId);
          } else {
            // 新增店面 
            database = new this.database.Database();
          }
          const saveData = _.clone(this.ruleForm, true);
          delete saveData.qrcode;
          if (this.ruleForm.qrcode) {
            // 关联插入
            // 编辑原来的信息
            const qrcode = this.$database.Object.createWithoutData('qrcode', this.ruleForm.qrcode);
            database.set('qrcode', qrcode);
          }
          delete saveData.objectId;
          database.set(saveData);
          database.save().then((data) => {
            // 关联插入用户shop列表(admin/super用户可看到所有店面)
              this.dialogFormVisible = false;
              this.updateShopList();
              this.$message.success('添加店面成功');
          });
        } else {
          this.$message({
            message: '表单验证有误',
            type: 'warning'
          });
        }
      });
    },
  },
  data() {
    return {
      qrcodeList: [],
      ruleForm: {
        objectId: '',
        name: '',
        address: '',
        qrcode: '',
        remark: '',
      },
      rules: {
        name: [
          {
            required: true,
            message: '请输入店面的名称',
            trigger: 'change'
          },
        ],
        address: [
          {
            required: true,
            message: '请输入店面的地址',
            trigger: 'change'
          },
        ],
        qrcode: [
          {
            required: true,
            message: '请选择店面绑定的二维码',
            trigger: 'change'
          },
        ],
      }
    };
  }
};
</script>
