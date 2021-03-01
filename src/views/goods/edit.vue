<template>
  <div class="app-container">

    <el-card class="box-card">
      <h3>商品介绍</h3>
      <el-form ref="goods"  :model="goods" label-width="150px">
        <el-form-item label="商品编号" prop="goodsSn">
          <el-input v-model="goods.goodsSn"/>
        </el-form-item>
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="goods.name"/>
        </el-form-item>
        <el-form-item label="当前价格" prop="retailPrice">
          <el-input v-model="goods.retailPrice" placeholder="0.00">
            <template slot="append">元</template>
          </el-input>
        </el-form-item>

        <el-form-item label="商品图片">
          <el-upload
            action="#"
            :show-file-list="false"
            :before-upload="beforeAvatarUpload"
            class="avatar-uploader"
            accept=".jpg,.jpeg,.png,.gif">
            <img v-if="goods.picUrl" :src="goods.picUrl" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon"/>
          </el-upload>
        </el-form-item>

        <el-form-item label="宣传画廊">
          <el-upload
            ref="upload"
            action=""
            list-type="picture-card"
            :on-preview="handlePictureCardPreview"
            :on-remove="handleRemove"
            :http-request="uploadAvatar"
            :file-list="fileList"
          >
            <i class="el-icon-plus"></i>
          </el-upload>
          <el-dialog :visible.sync="dialogVisible">
            <img width="100%" :src="dialogImageUrl" alt="">
          </el-dialog>

        </el-form-item>

        <el-form-item label="商品数量">
          <el-input v-model="goods.num" placeholder="数量"/>
        </el-form-item>

        <el-form-item label="所属分类">
          <el-cascader :options="categoryList" :value="categoryId" expand-trigger="hover" @change="handleCategoryChange"/>
        </el-form-item>


        <el-form-item label="商品简介">
          <el-input v-model="goods.brief"/>
        </el-form-item>

        <el-form-item label="商品详细介绍">
          <el-input
            type="textarea"
            :rows="4"
            placeholder="请输入内容"
            v-model="goods.detail">
          </el-input>
        </el-form-item>
      </el-form>
    </el-card>

    <div class="op-container">
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handlePublish">上架</el-button>
    </div>

  </div>
</template>

<style>
  .el-card {
    margin-bottom: 10px;
  }

  .el-tag + .el-tag {
    margin-left: 10px;
  }

  .input-new-keyword {
    width: 90px;
    margin-left: 10px;
    vertical-align: bottom;
  }

  .avatar-uploader .el-upload {
    width: 145px;
    height: 145px;
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }

  .avatar-uploader .el-upload:hover {
    border-color: #20a0ff;
  }

  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 120px;
    height: 120px;
    line-height: 120px;
    text-align: center;
  }

  .avatar {
    width: 145px;
    height: 145px;
    display: block;
  }
</style>

<script>
  import { addGoods ,uploadFile ,multipleUpload,detailGoods,editGoods} from '@/api/goods'
  import {listCategory} from '@/api/category'
  import Editor from '@tinymce/tinymce-vue'
  import { MessageBox } from 'element-ui'

  export default {
    name: 'GoodsCreate',
    components: { Editor },

    data() {
      return {
        goodsId:0,
        categoryId:undefined,
        dialogImageUrl: '',
        dialogVisible: false,
        picList: [],
        fileList: [],
        categoryList: [],
        brandList: [],
        goods: { picUrl: ''},
        attributes: []
      }
    },
    computed: {

    },
    created() {
      this.getCategoryList()
      this.init()
    },

    methods: {
      init: function() {
        if (this.$route.query.goodsId == null) {
          return
        }

        const goodsId = this.$route.query.goodsId
        detailGoods(goodsId).then(res => {
          this.goods = res.data.data
          this.categoryId = res.data.data.categoryId
          this.fileList = [];
          for(let url of res.data.data.gallery.split(',')){
            this.fileList.push({
              url
            })
          }
          console.log('this.fileList',this.fileList)
        })
      },
      getCategoryList(){

        listCategory().then(res => {
          for (let item of res.data.data){
            let cate =  {}
            cate.label = item.name
            cate.value = item.categoryId
            this.categoryList.push(cate)
          }
          console.log('this.categoryList',this.categoryList)
        })
      },
      handleCategoryChange(value) {
        this.goods.categoryId = value[value.length - 1]
      },
      handleCategoryChange(value) {
        console.log('value',value)
        this.categoryId = value[0]
      },
      handleCancel: function() {
        this.$router.push({ path: '/goods/list' })
      },
      handlePublish: function() {
        let gallery = []
        for (let file of this.fileList){
          gallery.push(file.url)
        }
        console.log('this.fileList',this.fileList)
        this.goods.gallery = gallery.join(',')
        this.goods.categoryId = this.categoryId
        console.log(this.goods)
        this.$confirm(`确定修改么？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          editGoods(this.goods).then(res => {
            if(res.data.code === 200){
              this.$message({
                type: 'success',
                message: res.data.msg
              });
            }else {
              this.$message({
                type: 'error',
                message: res.data.msg
              });
            }
            this.goods = { picUrl: ''}
            this.fileList = []
            this.picList = []
            this.$router.push({ path: '/goods/list' })
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消！'
          });
        });
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
            this.goods.picUrl = path
          }
        })
        return isJPG && isLt2M;
      },
      uploadAvatar(item) {
        const formData = new FormData()
        formData.append('file', item.file)
        const uid = item.file.uid
        uploadFile(formData).then(res => {
          let path = res.data.data
          this.fileList.push({url:path})
          /*if(path !== null){
            this.picList.push({ key: uid, value: path })
            console.log('picList',this.picList)
            // this.emptyUpload()
          }*/
        }).catch(() => {
          this.$message.error('上传失败，请重新上传')
        })
      },
      handleRemove(file, fileList) {
        for(let i in this.fileList){
          if(this.fileList[i].url === file.url){
            delete this.fileList[i]
          }
        }
        console.log(this.fileList)
      },
      handlePictureCardPreview(file) {
        this.dialogImageUrl = file.url
        this.dialogVisible = true
      },
      /**
       * 清空上传组件
       */
      emptyUpload() {
        this.goods = { picUrl: ''}
        const mainImg = this.$refs.upload
        if (mainImg) {
          if (mainImg.length) {
            mainImg.forEach(item => {
              item.clearFiles()
            })
          } else {
            this.$refs.upload.clearFiles()
          }
        }
      }
    }
  }
</script>
