<template>
  <div class="app-container">

    <!-- 查询和其他操作 -->
    <div class="filter-container">
      <el-input v-model="listQuery.userId" clearable class="filter-item" style="width: 200px;" placeholder="请输入用户ID"/>
      <el-input v-model="listQuery.orderSn" clearable class="filter-item" style="width: 200px;" placeholder="请输入订单编号"/>
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">查找</el-button>
    </div>

    <!-- 查询结果 -->
    <el-table v-loading="listLoading" :data="list" size="small" element-loading-text="正在查询中。。。" border fit highlight-current-row>

      <el-table-column align="center" min-width="100" label="订单编号" prop="orderSn"/>

      <el-table-column align="center" label="用户ID" prop="userId"/>

      <el-table-column align="center" label="订单状态" prop="orderStatus">
        <template slot-scope="scope">
          <el-tag>{{ scope.row.orderStatus | orderStatusFilter }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column align="center" label="支付金额" prop="orderPrice"/>

      <el-table-column align="center" label="支付时间" prop="addTime"/>

      <el-table-column align="center" label="物流单号" prop="shipSn"/>

      <el-table-column align="center" label="操作" width="300" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button v-if="scope.row.orderStatus===1" type="primary" size="mini" @click="handleShip(scope.row)">发货</el-button>
          <el-button type="primary" size="mini" @click="detailOrder(scope.row)">详情</el-button>
          <el-button type="danger" size="mini" @click="deleteOrder(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.current" :limit.sync="listQuery.size" @pagination="getList" />

    <el-dialog title="详情" :visible.sync="dialogFormVisible">
      <el-table
        :data="goodsList"
        stripe
        style="width: 100%">
        <el-table-column align="center" label="商品编号" prop="goodsSn"/>

        <el-table-column align="center" min-width="100" label="名称" prop="name"/>

        <el-table-column align="center" property="iconUrl" label="图片">
          <template slot-scope="scope">
            <img :src="scope.row.picUrl" width="40">
          </template>
        </el-table-column>
        <el-table-column align="center" min-width="100" label="购买数量" prop="buyNum"/>
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogFormVisible = false">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<style>

</style>

<script>
import { listOrder,shipOrder, deletedOrder } from '@/api/order'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import checkPermission from '@/utils/permission' // 权限判断函数

const statusMap = {
  0: '未付款',
  1: '已付款',
  2: '已发货',
  3: '已收货',
  4: '已取消'
}

export default {
  name: 'Order',
  components: { Pagination },
  filters: {
    orderStatusFilter(status) {
      return statusMap[status]
    }
  },
  data() {
    return {
      dialogFormVisible:false,
      goodsList:[],
      list: undefined,
      total: 0,
      listLoading: true,
      shipChannelList: [],
      listQuery: {
        current: 1,
        size: 20,
        userId: undefined,
        orderSn: undefined,
        sort: 'add_time',
        order: 'desc'
      },
      statusMap,
    }
  },
  created() {
    this.getList()
  },
  methods: {
    checkPermission,
    getList() {
      this.listLoading = true
      listOrder(this.listQuery).then(res => {
        console.log('order',res.data.data.records)
        this.list = res.data.data.records
        this.total = res.data.data.total
        this.listLoading = false
      }).catch(() => {
        this.list = []
        this.total = 0
        this.listLoading = false
      })
    },
    detailOrder(row){
      this.goodsList = row.goodsList
      this.dialogFormVisible = true
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    deleteOrder(row) {
      this.$confirm(`确定删除订单为${row.orderSn}的订单发货？`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deletedOrder(row).then(res =>{
          this.$message({
            type: 'success',
            message: `${res.data.msg}`
          });
          this.getList()
        })

      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });
      });

    },
    handleShip(row) {
      this.$confirm(`确定订单为${row.orderSn}的订单发货？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        shipOrder({
          orderId:row.orderId
        }).then(res =>{
          this.$message({
            type: 'success',
            message: `${res.data.msg}`
          });
          this.getList()
        })

      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消发货'
        });
      });
    }
  }
}
</script>
