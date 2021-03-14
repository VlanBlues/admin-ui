<template>
  <div class="app-container">

    <!-- 查询和其他操作 -->
    <div class="filter-container">
      <el-input v-model="listQuery.userId" clearable class="filter-item" style="width: 200px;" placeholder="请输入用户ID"/>
      <el-input v-model="listQuery.goodsSn" clearable class="filter-item" style="width: 200px;" placeholder="请输入商品ID"/>
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">查找</el-button>
    </div>

    <!-- 查询结果 -->
    <el-table v-loading="listLoading" :data="list" size="small" element-loading-text="正在查询中。。。" border fit highlight-current-row>
      <el-table-column align="center" width="100px" label="收藏ID" prop="collectionId" sortable/>

      <el-table-column align="center" min-width="100px" label="用户ID" prop="userId"/>

      <el-table-column align="center" min-width="100px" label="商品Sn" prop="mallGoods.goodsSn"/>

      <el-table-column align="center" min-width="100px" label="商品名称" prop="mallGoods.name"/>

      <el-table-column align="center" property="iconUrl" label="图片">
        <template slot-scope="scope">
          <img :src="scope.row.mallGoods.picUrl" width="40">
        </template>
      </el-table-column>

      <el-table-column align="center" min-width="100px" label="添加时间" prop="addTime"/>

    </el-table>

    <pagination v-show="total>0" :total="total" :current.sync="listQuery.current" :size.sync="listQuery.size" @pagination="getList" />

  </div>
</template>

<script>
import { listByUserId } from '@/api/collection'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination

export default {
  name: 'Collect',
  components: { Pagination },
  data() {
    return {
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        current: 1,
        size: 20,
        userId: undefined,
        goodsSn: undefined,
        sort: 'add_time',
        order: 'desc'
      },
      downloadLoading: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      listByUserId(this.listQuery).then(res => {
        console.log('collection',res.data.data)
        this.list = res.data.data.records
        this.total = res.data.data.total
        this.listLoading = false
      }).catch(() => {
        this.list = []
        this.total = 0
        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.current = 1
      this.getList()
    },
    resetForm() {
      this.dataForm = {
        id: undefined,
        userId: '',
        valueId: '',
        addTime: undefined
      }
    }
  }
}
</script>
