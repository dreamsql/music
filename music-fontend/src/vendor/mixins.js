const formMixin = {
  methods: {
    resetForm(formName = 'ruleForm') {
      delete this.ruleForm.objectId;
      delete this.ruleForm.qrcode;
      this.$refs[formName].resetFields();
    },
    getPageData() {
      this.database.query.find().then((data) => {
        this.tableData = this.$project.dataParseJson(data);
      });
    },
    saveData(type, formName = 'ruleForm') {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          let database;
          if (this.ruleForm.objectId) {
            database = this.$database.Object.createWithoutData(type, this.ruleForm.objectId);
          } else {
            database = new this.database.Database();
          }
          const saveData = _.clone(this.ruleForm, true);
          delete saveData.objectId;
          database.set(saveData);
          database.save().then((data) => {
            this.dialogFormVisible = false;
            this.getPageData();
          });
        } else {
          this.$message({
            message: '表单验证有误',
            type: 'warning'
          });
        }
      });
    },
    defaultTable(row, column) {
      return row[column.property] ? row[column.property] : '无';
    },
    convertDate(row, column) {
      return new Date(row[column.property]).toLocaleString();
    },
  },
  data() {
    return {
      database: {
        query: undefined,
        Database: undefined,
      },
      dialogFormVisible: false,
      tableData: [],
      ruleForm: {},
      rules: {},
    }
  }
};

export {
  formMixin,
};
