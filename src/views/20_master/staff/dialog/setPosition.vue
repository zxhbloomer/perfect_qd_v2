<template>
  <el-dialog
    v-if="listenVisible"
    v-el-drag-dialog
    v-loading="settings.loading"
    element-loading-text="拼命加载中，请稍后..."
    element-loading-background="rgba(255, 255, 255, 0.7)"
    title="设置岗位员工"
    :visible="visible"
    :close-on-click-modal="PARAMETERS.DIALOG_CLOSE_BY_CLICK"
    :close-on-press-escape="PARAMETERS.DIALOG_CLOSE_BY_ESC"
    :show-close="PARAMETERS.DIALOG_SHOW_CLOSE"
    :append-to-body="true"
    :modal-append-to-body="true"
    width="1100px"
    destroy-on-close
  >
    <el-form
      ref="minusForm"
      :inline="true"
      :model="dataJson.searchForm"
      label-position="getLabelPosition()"
      class="floatRight"
    >
      <el-form-item label="">
        <el-input v-model.trim="dataJson.searchForm.position_name" clearable placeholder="岗位名称" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" plain icon="el-icon-search" @click="handleSearch">查询</el-button>
      </el-form-item>
    </el-form>
    <el-tabs type="card" class="floatLeft" @tab-click="handleTabsClick">
      <el-tab-pane>
        <template slot="label">全部岗位<el-badge :value="dataJson.tabs.count.all" type="danger" /></template>
      </el-tab-pane>
      <el-tab-pane>
        <template slot="label">已设置岗位<el-badge :value="dataJson.tabs.count.settled" type="danger" /></template>
      </el-tab-pane>
      <el-tab-pane>
        <template slot="label">未设置岗位<el-badge :value="dataJson.tabs.count.unsettled" type="danger" /></template>
      </el-tab-pane>
    </el-tabs>
    <el-table
      ref="multipleTable"
      v-loading="settings.loading"
      :data="dataJson.listData"
      :element-loading-text="'正在拼命加载中...'"
      element-loading-background="rgba(255, 255, 255, 0.5)"
      :height="400"
      stripe
      border
      fit
      highlight-current-row
      :default-sort="{prop: 'name', order: 'descending'}"
      style="width: 100%"
      @sort-change="handleSortChange"
    >
      <el-table-column type="index" width="45" label="No" />
      <el-table-column header-align="center" show-overflow-tooltip sortable="custom" min-width="150" :sort-orders="settings.sortOrders" prop="group_full_simple_name" label="集团" />
      <el-table-column header-align="center" show-overflow-tooltip sortable="custom" min-width="80" :sort-orders="settings.sortOrders" prop="company_simple_name" label="企业" />
      <el-table-column header-align="center" show-overflow-tooltip sortable="custom" min-width="80" :sort-orders="settings.sortOrders" prop="dept_full_simple_name" label="部门" />
      <el-table-column header-align="center" show-overflow-tooltip sortable="custom" min-width="100" :sort-orders="settings.sortOrders" prop="name" label="岗位" />

    </el-table>
    <pagination ref="minusPaging" :total="dataJson.paging.total" :page.sync="dataJson.paging.current" :limit.sync="dataJson.paging.size" @pagination="getDataList" />
    <div slot="footer" class="dialog-footer">
      <el-divider />
      <el-button plain @click="handleDoCancel()">取消</el-button>
      <el-button @click="handleDoOk()">确定</el-button>
    </div>
  </el-dialog>
</template>

<style scoped>
  .floatRight {
    float: right;
  }
  .floatLeft {
    float: left;
  }
</style>

<script>
import elDragDialog from '@/directive/el-drag-dialog'
import { getPositionStaffData } from '@/api/20_master/staff/staff'
import deepCopy from 'deep-copy'
import Pagination from '@/components/Pagination'

export default {
  components: { Pagination },
  directives: { elDragDialog },
  props: {
    // 页面是否显示参数
    visible: {
      type: Boolean,
      default: false
    },
    data: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      dataJson: {
        // 查询使用的json
        searchForm: {
          // 分页控件的json
          pageCondition: deepCopy(this.PARAMETERS.PAGE_JSON),
          id: undefined,
          position_name: '',
          active_tabs_index: 0
        },
        // 分页控件的json
        paging: deepCopy(this.PARAMETERS.PAGE_JSON),
        // 页签cout数量
        tabs: {
          count: {
            all: 0,
            settled: 0,
            unsettled: 0
          },
          active_tabs_index: 0 // 当前被激活的页签
        },
        // table使用的json
        listData: null
      },
      // 页面设置json
      settings: {
        // loading 状态
        loading: true
      }
    }
  },
  computed: {
    listenVisible() {
      return this.visible
    }
  },
  // 监听器
  watch: {
  },
  created() {
    this.initShow()
  },
  methods: {
    initShow() {
      // 初始化查询
      this.getDataList()
    },
    getDataList() {
      // 查询逻辑
      this.settings.loading = true
      this.dataJson.searchForm.pageCondition.current = this.dataJson.paging.current
      this.dataJson.searchForm.pageCondition.size = this.dataJson.paging.size
      this.dataJson.searchForm.id = this.data.id
      getPositionStaffData(this.dataJson.searchForm).then(response => {
        this.dataJson.tabs.count.all = response.data.all
        this.dataJson.tabs.count.settled = response.data.settled
        this.dataJson.tabs.count.unsettled = response.data.unsettled
        this.dataJson.listData = response.data.list.records
        this.dataJson.paging = response.data.list
        this.dataJson.paging.records = {}
      }).finally(() => {
        this.settings.loading = false
      })
    },
    handleSortChange(column) {
      // 服务器端排序
      if (column.order === 'ascending') {
        this.dataJson.searchForm.pageCondition.sort = column.prop
      } else if (column.order === 'descending') {
        this.dataJson.searchForm.pageCondition.sort = '-' + column.prop
      }
      this.getDataList()
    },
    handleSearch() {
      this.getDataList()
    },
    // tabs点击事件
    handleTabsClick(tab, event) {
      if (this.dataJson.tabs.active_tabs_index === tab.index) {
        return
      }
      this.dataJson.tabs.active_tabs_index = tab.index
      this.dataJson.searchForm.active_tabs_index = tab.index
      this.initShow()
    },
    // 确定
    handleDoOk() {
      this.$emit('closeMeOk')
    },
    // 取消
    handleDoCancel() {
      this.$emit('closeMeCancel')
    }
  }
}
</script>
