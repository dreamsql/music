<template lang="html">
  <div class="">
    <template v-if="$bus.adminUser.role == 'super'">
      <el-button type="primary" @click="showEdit()" >添加用户</el-button>
      <br>
      <br>
    </template>
    <el-table
      :data="tableData"
      empty-text="无"
      border
      style="width: 100%"
      >
      <el-table-column
        type="index"
        width="80">
      </el-table-column>
      <el-table-column
        prop="user.username"
        label="用户名"
        >
      </el-table-column>
      <el-table-column label="管理店面">
        <template scope="scope">
          <span
            v-for="(shop, index) in  scope.row.shop"
            :key="index"
            >
            <router-link
              :to="{path: '/qrcode', query: {id: shop.objectId}}"
              >
              <el-button type="text">{{shop.name}}</el-button>
            </router-link>，
          </span>
        </template>
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
      <el-table-column label="操作" v-if="$bus.adminUser.role == 'super'">
        <template scope="scope">
          <el-button @click="showEdit(scope.row.objectId)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      title="用户操作"
      :visible.sync="dialogFormVisible"
      :close-on-click-modal="false"
      @open="getShopList"
      @close="resetForm"
      >
      <el-form :model="ruleForm" :rules="rules" label-width="120px" ref="ruleForm">
        <el-form-item label="用户名" prop="user.username">
          <el-input v-model="ruleForm.user.username" auto-complete="off" :disabled="!!this.ruleForm.objectId"></el-input>
        </el-form-item>
        <el-form-item v-if="!this.ruleForm.objectId" label="登录密码" prop="user.password">
          <el-input type="password" v-model="ruleForm.user.password" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item v-if="!this.ruleForm.objectId" label="绑定邮箱" prop="user.email">
          <el-input type="email" v-model="ruleForm.user.email" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="管理店面" prop="shop">
          <el-select v-model="ruleForm.shop" multiple placeholder="请选择用户管理的店面" clearable>
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
import { formMixin } from '@/vendor/mixins';
import { LocalStore as Store  } from '@/vendor/store';

export default {
  mixins: [formMixin],
  created() {
    this.database.query = new this.$database.Query('admin_user');
    this.database.Database = this.$database.Object.extend('admin_user');
    this.database.query.include('user');
    this.database.query.include('shop');
    this.getPageData();
  },
  methods: {
    getShopList() {
      this.$bus.getShopList().then((data) => {
        this.shopList = this.$project.dataParseJson(data);
      });
    },
    saveUser(userData) {
      return new Promise((resolve, reject) => {
        const user = new this.$database.User();
        // 设置用户名
        user.setUsername(userData.username);
        // 设置密码
        user.setPassword(userData.password);
        // 设置邮箱
        user.setEmail(userData.email);
        user.signUp().then((loginedUser) => {
          resolve(loginedUser);
        }, (error) => {
          this.$message.error(error.message);
          // reject(error);
        });
      });
    },
    saveData(formName = 'ruleForm') {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          let database;
          const saveData = _.clone(this.ruleForm, true);
          saveData.shop = [];
          this.ruleForm.shop.forEach((shopId) => {
            saveData.shop.push(this.$database.Object.createWithoutData('shop', shopId));
          });
          delete saveData.objectId;
          new Promise((resolve, reject) => {
            if (this.ruleForm.objectId) {
              database = this.$database.Object.createWithoutData('admin_user', this.ruleForm.objectId);
              delete saveData.user;
              resolve();
            } else {
              database = new this.database.Database();
              this.saveUser(saveData.user).then((user) => {
                saveData.user = user;
                resolve();
              });
            }
          }).then(() => {
            database.set(saveData);
            // 只能创建商家用户
            if (Store.get('admin_user').role != 'super') {
              database.set('role', 'shop_user');
              database.set('remark', '商家');
            }
            database.save().then((data) => {
              this.dialogFormVisible = false;
              this.getPageData();
            });
          });
        } else {
          this.$message({
            message: '表单验证有误',
            type: 'warning'
          });
        }
      });
    },
    resetForm(formName = 'ruleForm') {
      this.ruleForm.objectId = '';
      this.ruleForm.user = {
        username: '',
        objectId: '',
      };
      this.$refs[formName].resetFields();
    },
    showEdit(id) {
      if (id) {
        const query = new this.$database.Query('admin_user');
        // 关联用户
        query.include('user');
        // const user = this.$database.Object.createWithoutData('admin_user', id);
        query.get(id).then((data) => {
          const user = this.$project.dataParseJson(data);
          const shopList = [];
          if (user.shop && user.shop.length > 0) {
            user.shop.forEach((shop) => {
              shopList.push(shop.objectId);
            })
          }
          this.ruleForm.objectId = user.objectId;
          this.ruleForm.user = user.user;
          this.ruleForm.shop = shopList;
          this.ruleForm.remark = user.remark;
          // this.ruleForm.shop = user.shop.objectId;
        });
      }
      this.dialogFormVisible = true;
    },
  },
  data() {
    return {
      shopList: [],
      dialogFormVisible: false,
      ruleForm: {
        user: {
          username: '',
          objectId: '',
        },
        objectId: '',
        shop: [],
        remark: '',
      },
      rules: {
        'user.username': [
          {
            required: true,
            message: '请输入用户名',
            trigger: 'change'
          },
        ],
        'user.password': [
          {
            required: true,
            message: '请输入登录密码',
            trigger: 'change'
          },
        ],
        'user.email': [
          {
            required: true,
            type: 'email',
            message: '请输入绑定邮箱',
            trigger: 'change'
          },
        ],
      }
    };
  },
};
</script>
