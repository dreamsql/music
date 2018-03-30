<template lang="html">
  <div class="">
    <el-button type="primary" @click="showEdit()">添加会员等级</el-button>
    <br>
    <br>
    <el-table
      :data="tableData"
      border
      style="width: 100%"
      >
      <el-table-column
        prop="name"
        label="级别"
        >
      </el-table-column>
      <el-table-column
        prop="times"
        label="每月可点播次数"
        >
      </el-table-column>
      <el-table-column
        prop="fees"
        label="会员费">
      </el-table-column>
      <el-table-column
        prop="remark"
        label="备注">
      </el-table-column>
      <el-table-column label="操作" width="80">
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

    <el-dialog title="收货地址" :visible.sync="dialogFormVisible" @close="resetForm">
      <el-form :model="ruleForm" :rules="rules" label-width="120px" ref="ruleForm">
        <el-form-item label="会员名称 " prop="name">
          <el-input v-model="ruleForm.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="每月点播次数" prop="times">
          <el-input-number v-model.number="ruleForm.times" :min="0"></el-input-number>
        </el-form-item>
        <el-form-item label="会员费" prop="fees">
          <el-input-number v-model.number="ruleForm.fees" :min="0"></el-input-number>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input type="textarea" autosize :rows="2" v-model="ruleForm.remark" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveData('level')">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { formMixin } from '@/vendor/mixins';

export default {
  mixins: [formMixin],
  created() {
    this.database.query = new this.$database.Query('level');
    this.database.Database = this.$database.Object.extend('level');
    this.getPageData();
  },
  methods: {
    showEdit(id) {
      if (id) {
        this.database.query.get(id).then((data) => {
          const databse = this.$project.dataParseJson(data);
          this.ruleForm.objectId = databse.objectId;
          this.ruleForm.name = databse.name;
          this.ruleForm.times = databse.times;
          this.ruleForm.fees = databse.fees;
          this.ruleForm.remark = databse.remark;
          this.ruleForm.objectId = databse.objectId;
        });
      }
      this.dialogFormVisible = true;
    },
  },
  data() {
    return {
      ruleForm: {
        objectId: '',
        name: '',
        times: '',
        remark: '',
        fees: '',
      },
      rules: {
        name: [
          {
            required: true,
            message: '请输入会员的名称',
            trigger: 'change'
          },
        ],
        times: [
          {
            required: true,
            type: 'number',
            message: '请输入会员可点播次数',
            trigger: 'change'
          },
        ],
        fees: [
          {
            required: true,
            type: 'number',
            message: '请输入会员费用',
            trigger: 'change'
          },
        ],
      }
    }
  }
};
</script>
