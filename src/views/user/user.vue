<template>
  <div class="app-container">

    <!-- 查询和其他操作 -->
    <div class="filter-container">
      <el-input v-model="listQuery.username" clearable class="filter-item" style="width: 200px;" placeholder="请输入用户名"/>
      <el-input v-model="listQuery.mobile" clearable class="filter-item" style="width: 200px;" placeholder="请输入手机号"/>
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">查找</el-button>
      <el-button class="filter-item" type="success" icon="el-icon-plus" @click="handleAdd">添加</el-button>
    </div>

    <!-- 查询结果 -->
    <el-table stripe v-loading="listLoading" :data="list" size="small" element-loading-text="正在查询中。。。" border fit highlight-current-row>
      <el-table-column align="center" width="100px" label="用户ID" prop="userId" sortable/>

      <el-table-column align="center" label="头像" prop="avatar" :size="50" width="100px">
        <template slot-scope="scope">
          <el-avatar :src="scope.row.avatar"></el-avatar>
        </template>
      </el-table-column>

      <el-table-column align="center" label="用户名" prop="username"/>

      <el-table-column align="center" label="昵称" prop="nickname"/>

      <el-table-column align="center" label="手机号码" prop="mobile"/>

      <el-table-column align="center" label="性别" prop="gender" width="100px">
        <template slot-scope="scope">
          <el-tag >{{ genderDic[scope.row.gender] }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column align="center" label="生日" prop="birthday"/>

      <el-table-column align="center" label="注册时间" prop="addTime" sortable/>

      <el-table-column align="center" label="更新时间" prop="updateTime" sortable/>

      <el-table-column align="center" label="最后登录时间" prop="lastLoginTime" sortable/>

      <el-table-column align="center" label="状态" prop="deleted" width="100px">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.deleted === 0">{{ statusDic[scope.row.deleted] }}</el-tag>
          <el-tag v-else type="danger">{{ statusDic[scope.row.deleted] }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="200" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button v-if="scope.row.deleted === 0" type="danger" size="mini" @click="handelDelete(scope.row.userId,'失效')">失效</el-button>
          <el-button v-else type="success" size="mini" @click="handelDelete(scope.row.userId,'恢复')">可用</el-button>
          <el-button type="primary" size="mini" @click="handleEdit(scope.row)">编辑</el-button>
        </template>
      </el-table-column>

    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />
    <el-dialog :visible.sync="centerDialogVisible" :title="dialogTitle" center width="30%">
      <el-row :gutter="15">
        <el-form ref="elForm" :model="formData" :rules="rules"  label-width="70px"
                 label-position="left">
          <el-col :span="24">
            <el-form-item label="头像" prop="avatar" required>
              <el-upload
                class="avatar-uploader"
                action=""
                :show-file-list="false"
                :on-success="handleAvatarSuccess"
                :before-upload="beforeAvatarUpload"
                >
                <img v-if="formData.avatar" :src="formData.avatar" class="avatar">
                <i v-else class="el-icon-plus avatar-uploader-icon"></i>
              </el-upload>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="formData.username" placeholder="请输入用户名" clearable
                        prefix-icon='el-icon-notebook-2' :style="{width: '100%'}"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="昵称" prop="nickname">
              <el-input v-model="formData.nickname" placeholder="昵称" clearable prefix-icon='el-icon-user'
                        :style="{width: '100%'}"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="密码" prop="password">
              <el-input v-model="formData.password" placeholder="请输入密码" clearable prefix-icon='el-icon-lock'
                        show-password :style="{width: '100%'}"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="性别" prop="gender">
              <el-radio-group v-model="formData.gender" size="medium">
                <el-radio v-for="(item, index) in genderOptions" :key="index" :label="item.value"
                          :disabled="item.disabled">{{item.label}}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="手机号" prop="mobile">
              <el-input v-model="formData.mobile" placeholder="请输入手机号" clearable prefix-icon='el-icon-phone'
                        :style="{width: '100%'}"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="生日" prop="birthday">
              <el-date-picker v-model="formData.birthday" format="yyyy-MM-dd" value-format="yyyy-MM-dd"
                              :style="{width: '100%'}" placeholder="请选择生日" clearable></el-date-picker>
            </el-form-item>
          </el-col>
        </el-form>
      </el-row>
      <div slot="footer">
        <el-button @click="close">取消</el-button>
        <el-button type="primary" @click="handelConfirm">确定</el-button>
      </div>
    </el-dialog>
  </div>



</template>

<script>
import { fetchList, uploadFile ,addOrUpdate,deleteUser} from '@/api/user'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination

export default {
  name: 'User',
  components: { Pagination },
  data() {
    return {
      list: null,
      total: 0,
      listLoading: true,
      //添加 编辑弹出
      centerDialogVisible:false,
      dialogTitle:'添加',
      imageUrl: '',
      listQuery: {
        current: 1,
        size: 20,
        username: undefined,
        mobile: undefined,
      },
      //弹出框数据
      formData: {
        avatar: null,
        username: undefined,
        nickname: undefined,
        password: undefined,
        gender: "1",
        mobile: undefined,
        birthday: "2020-10-17",
      },
      rules: {
        username: [{
          required: true,
          message: '请输入用户名',
          trigger: 'blur'
        }],
        nickname: [{
          required: true,
          message: '昵称',
          trigger: 'blur'
        }],
        password: [{
          required: true,
          message: '请输入密码',
          trigger: 'blur'
        }],
        gender: [{
          required: true,
          message: '性别不能为空',
          trigger: 'change'
        }],
        mobile: [{
          required: true,
          message: '请输入手机号',
          trigger: 'blur'
        }],
        birthday: [{
          required: true,
          message: '请选择生日',
          trigger: 'change'
        }],
      },
      genderOptions: [{
        "label": "男",
        "value": "1"
      }, {
        "label": "女",
        "value": "2"
      }],
      downloadLoading: false,
      genderDic: ['未知', '男', '女'],
      statusDic: ['可用', '失效'],
      detailDialogVisible: false,
      agencyDetail: {},
      approveDialogVisible: false,
      approveForm: {
        userId: undefined,
        settlementRate: undefined
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        console.log(response)
        this.list = response.data.data.records
        this.total = response.data.data.total
        this.listLoading = false
      }).catch(() => {
        this.list = []
        this.total = 0
        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    onClose() {
      this.$refs['elForm'].resetFields()
    },
    close() {
      this.centerDialogVisible = false;
    },
    handelConfirm() {
      this.$refs['elForm'].validate(valid => {
        if(valid){
          this.$confirm(`确定修改么？`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            addOrUpdate(this.formData).then(res => {
              if(res.data.code === 200){
                this.$message({
                  type: 'success',
                  message: `${this.dialogTitle}成功!`
                });
                this.getList();
                this.centerDialogVisible = false
              }else {
                this.$message({
                  type: 'error',
                  message: `${this.dialogTitle}失败!`
                });
              }
            })
          }).catch(() => {
            this.$message({
              type: 'info',
              message: '已取消！'
            });
          });

        }
      })
    },
    handleAdd(){
      // this.$refs['elForm'].resetFields();
      Object.assign(this.formData, this.$options.data().formData);
      this.dialogTitle = '添加'
      this.centerDialogVisible = true;

    },
    handleEdit(data){
      this.dialogTitle = '编辑'
      this.formData = data
      this.centerDialogVisible = true
      Object.assign(this.formData,data)
    },
    handelDelete(userId,msg){
      this.$confirm(`是否${msg}id为${userId}的用户么？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteUser(userId).then(res => {
          if(res.data.code === 200){
            this.$message({
              type: 'success',
              message: `删除成功!`
            });
            this.getList();
            this.centerDialogVisible = false
          }else {
            this.$message({
              type: 'error',
              message: `删除失败!`
            });
          }
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });
      });

    },
    handleAvatarSuccess(res, file) {
      this.imageUrl = URL.createObjectURL(file.raw);
      console.log(res)
    },
    beforeAvatarUpload(file) {
      const isJPG = file.type === 'image/jpeg';
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isJPG) {
        this.$message.error('上传头像图片只能是 JPG 格式!');
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!');
      }
      let fd = new FormData();
      fd.append('file',file);
      uploadFile(fd).then(res => {
        let path = res.data.data
        if(path !== null){
          this.formData.avatar = path
        }
      })
      return isJPG && isLt2M;
    }
  }
}
</script>
<style>
  .avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .avatar-uploader .el-upload:hover {
    border-color: #409EFF;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 100px;
    height: 100px;
    line-height: 100px;
    text-align: center;
  }
  .avatar {
    width: 100px;
    height: 100px;
    display: block;
  }
</style>
