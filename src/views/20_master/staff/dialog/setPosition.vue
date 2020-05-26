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
        <template slot="label">未设置岗位<el-badge :value="dataJson.tabs.count.settled" type="danger" /></template>
      </el-tab-pane>
    </el-tabs>
    <el-table
      ref="multipleTable"
      v-loading="settings.loading"
      :data="dataJson.listData"
      :element-loading-text="'正在拼命加载中...'"
      element-loading-background="rgba(255, 255, 255, 0.5)"
      :height="height"
      stripe
      border
      fit
      highlight-current-row
      :default-sort="{prop: 'u_time', order: 'descending'}"
      style="width: 100%"
      @sort-change="handleSortChange"
    >
      <el-table-column type="index" width="45" label="No" />
      <el-table-column show-overflow-tooltip sortable="custom" min-width="150" :sort-orders="settings.sortOrders" prop="name" label="集团">
        <template slot-scope="scope">
          <el-link style="float: right" type="primary" @click="handleView(scope.row)"><i class="el-icon-info" /></el-link>
          <span> {{ scope.row.name }} </span>
        </template>
      </el-table-column>
      <el-table-column show-overflow-tooltip sortable="custom" min-width="80" :sort-orders="settings.sortOrders" prop="sex_text" label="企业">
        <template slot-scope="scope">
          <el-link style="float: right" type="primary" @click="handleView(scope.row)"><i class="el-icon-info" /></el-link>
          <span> {{ scope.row.name }} </span>
        </template>
      </el-table-column>
      <el-table-column show-overflow-tooltip sortable="custom" min-width="80" :sort-orders="settings.sortOrders" prop="birthday" label="部门">
        <template slot-scope="scope">
          <el-link style="float: right" type="primary" @click="handleView(scope.row)"><i class="el-icon-info" /></el-link>
          <span> {{ scope.row.name }} </span>
        </template>
      </el-table-column>
      <el-table-column show-overflow-tooltip sortable="custom" min-width="100" :sort-orders="settings.sortOrders" prop="email" label="岗位">
        <template slot-scope="scope">
          <el-link style="float: right" type="primary" @click="handleView(scope.row)"><i class="el-icon-info" /></el-link>
          <span> {{ scope.row.name }} </span>
        </template>
      </el-table-column>

    </el-table>
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

export default {
  components: { },
  directives: { elDragDialog },
  props: {
    // 页面是否显示参数
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      dataJson: {
        // 查询使用的json
        searchForm: {
          position_name: ''
        },
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
      this.settings.loading = false
    },
    handleSearch() {
      this.getDataList()
    },
    // tabs点击事件
    handleTabsClick(tab, event) {
      if (this.dataJson.tabs.active_tabs_index === tab.index) {
        return
      }
      switch (tab.index) {
        case '0':
          // 全部岗位
          this.initShow()
          break
        case '1':
          // 已设置岗位
          this.initShow()
          break
        case '2':
          // 未设置岗位
          this.initShow()
          break
      }
      this.dataJson.tabs.active_tabs_index = tab.index
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
