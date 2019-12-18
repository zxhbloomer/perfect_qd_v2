<template>
  <div>
    <el-table
      ref="multipleTable"
      v-loading="settings.listLoading"
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
      @row-click="handleRowClick"
      @row-dblclick="handleRowDbClick"
      @current-change="handleCurrentChange"
      @sort-change="handleSortChange"
      @selection-change="handleSelectionChange"
    >
      <!-- <el-table-column type="selection" width="45" prop="id" /> -->
      <el-table-column type="index" width="45" />
      <el-table-column show-overflow-tooltip sortable="custom" min-width="150" :sort-orders="settings.sortOrders" prop="code" label="岗位编号" />
      <el-table-column show-overflow-tooltip sortable="custom" min-width="150" :sort-orders="settings.sortOrders" prop="name" label="岗位全称" />
      <el-table-column show-overflow-tooltip sortable="custom" min-width="150" :sort-orders="settings.sortOrders" prop="simple_name" label="岗位简称" />
      <el-table-column show-overflow-tooltip sortable="custom" min-width="150" :sort-orders="settings.sortOrders" prop="descr" label="岗位描述" />
      <el-table-column show-overflow-tooltip min-width="150" prop="descr" label="描述" />
      <el-table-column min-width="70" :sort-orders="settings.sortOrders" label="删除" :render-header="renderHeaderIsDel">
        <template slot-scope="scope">
          <el-tooltip :content="'删除状态: ' + scope.row.is_del" placement="top">
            <el-switch
              v-model="scope.row.is_del"
              active-color="#ff4949"
              inactive-color="#13ce66"
              :active-value="true"
              :inactive-value="false"
              :width="30"
              disabled
              @change="handleDel(scope.row)"
            />
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column sortable="custom" min-width="170" :sort-orders="settings.sortOrders" prop="u_time" label="更新时间" />
    </el-table>
    <pagination ref="minusPaging" :total="dataJson.paging.total" :page.sync="dataJson.paging.current" :limit.sync="dataJson.paging.size" @pagination="getDataList" />
  </div>
</template>

<style scoped>
  .floatRight {
    float: right;
  }
  .floatLeft {
    float: left;
  }
  .el-form-item .el-select {
    width: 100%;
  }
</style>

<script>
import { getPositionListApi } from '@/api/20_master/org/org'
import elDragDialog from '@/directive/el-drag-dialog'
import Pagination from '@/components/Pagination'

export default {
  name: 'P00000177', // 页面id，和router中的name需要一致，作为缓存
  components: { Pagination },
  directives: { elDragDialog },
  mixins: [],
  props: {
    height: {
      type: Number,
      default: 200
    }
  },
  data() {
    return {
      dataJson: {
        // 查询使用的json
        searchForm: {
          condition: null,
          // 翻页条件
          pageCondition: {
            current: 1,
            size: 20,
            sort: '-u_time' // 排序
          }
        },
        // 分页控件的json
        paging: {
          current: 1,
          size: 20,
          total: 0
        },
        // table使用的json
        listData: null,
        // 单条数据 json的，初始化原始数据
        tempJsonOriginal: {
          id: undefined,
          name: '',
          code: '',
          descr: '',
          dbversion: 0
        },
        // 单条数据 json
        currentJson: null,
        tempJson: null,
        inputSettings: {
          maxLength: {
            name: 20,
            code: 20,
            descr: 200,
            simple_name: 20
          }
        },
        // 当前表格中的索引，第几条
        rowIndex: 0,
        // 当前选中的行（checkbox）
        multipleSelection: []
      },
      // 页面设置json
      settings: {
        // 表格排序规则
        sortOrders: ['ascending', 'descending'],
        // 按钮状态
        btnShowStatus: {
          showUpdate: false,
          showCopyInsert: false,
          showExport: false
        },
        // loading 状态
        listLoading: true,
        duration: 4000
      },
      popSettingsData: {
        // 弹出窗口状态名称
        textMap: {
          update: '修改',
          insert: '新增',
          copyInsert: '复制新增'
        },
        // 按钮状态
        btnShowStatus: {
          showInsert: false,
          showUpdate: false,
          showCopyInsert: false
        },
        // 按钮状态：是否可用
        btnDisabledStatus: {
          disabledReset: false,
          disabledInsert: false,
          disabledUpdate: false,
          disabledCopyInsert: false
        },
        // 重置按钮点击后
        btnResetStatus: false,
        // 以下为pop的内容：数据弹出框
        selection: [],
        dialogStatus: '',
        dialogFormVisible: false,
        // pop的check内容
        rules: {
          name: [{ required: true, message: '请输入岗位全称', trigger: 'change' }],
          code: [{ required: true, message: '请输入岗位编号', trigger: 'change' }],
          simple_name: [{ required: true, message: '请输入岗位简称', trigger: 'change' }]
        }
      },
      // 导入窗口的状态
      popSettingsImport: {
        // 弹出窗口会否显示
        dialogFormVisible: false,
        // 模版文件地址
        templateFilePath: process.env.VUE_APP_BASE_API + '/api/v1/template.html?id=P00000030',
        // 错误数据文件
        errorFileUrl: ''
      }
    }
  },
  computed: {
    // 是否为更新模式
    isUpdateModel() {
      if (this.popSettingsData.dialogStatus === 'insert' || this.popSettingsData.dialogStatus === 'copyInsert') {
        return false
      } else {
        return true
      }
    }
  },
  // 监听器
  watch: {
    // 监听页面上面是否有修改，有修改按钮高亮
    'dataJson.tempJson': {
      handler(newVal, oldVal) {
        if (this.popSettingsData.btnResetStatus === true) {
          // 点击了重置按钮
          this.popSettingsData.btnDisabledStatus.disabledReset = true
          this.popSettingsData.btnDisabledStatus.disabledInsert = true
          this.popSettingsData.btnDisabledStatus.disabledUpdate = true
          this.popSettingsData.btnDisabledStatus.disabledCopyInsert = true
          this.popSettingsData.btnResetStatus = false
        } else if (this.popSettingsData.dialogFormVisible) {
          // 有修改按钮高亮
          this.popSettingsData.btnDisabledStatus.disabledReset = false
          this.popSettingsData.btnDisabledStatus.disabledInsert = false
          this.popSettingsData.btnDisabledStatus.disabledUpdate = false
          this.popSettingsData.btnDisabledStatus.disabledCopyInsert = false
        }
      },
      deep: true
    },
    // 弹出窗口初始化，按钮不可用
    'popSettingsData.dialogFormVisible': {
      handler(newVal, oldVal) {
        if (this.popSettingsData.dialogFormVisible) {
          this.popSettingsData.btnDisabledStatus.disabledReset = true
          this.popSettingsData.btnDisabledStatus.disabledInsert = true
          this.popSettingsData.btnDisabledStatus.disabledUpdate = true
          this.popSettingsData.btnDisabledStatus.disabledCopyInsert = true
        }
      }
    },
    // 选中的数据，使得导出按钮可用，否则就不可使用
    'dataJson.multipleSelection': {
      handler(newVal, oldVal) {
        if (newVal.length > 0) {
          this.settings.btnShowStatus.showExport = true
        } else {
          this.settings.btnShowStatus.showExport = false
        }
      }
    }
  },
  created() {
    this.initShow()
  },
  mounted() {
    // 描绘完成
    this.$on('global:getDataList', _data => {
      this.dataJson.searchForm.condition = _data
      this.getDataList()
    })
  },
  methods: {
    initTempJsonOriginal() {
      // 单条数据 json的，初始化原始数据
      this.dataJson.tempJsonOriginal =
      {
        id: undefined,
        name: '',
        code: '',
        descr: '',
        dbversion: 0
      }
    },
    initShow() {
      // 初始化查询
      this.getDataList()
      // 数据初始化
      this.dataJson.tempJson = Object.assign({}, this.dataJson.tempJsonOriginal)
    },
    // 下拉选项控件事件
    handleSelectChange(val) {
    },
    // 获取行索引
    getRowIndex(row) {
      const _index = this.dataJson.listData.lastIndexOf(row)
      return _index
    },
    // 行点击
    handleRowClick(row) {
      this.dataJson.tempJson = Object.assign({}, row) // copy obj
      this.dataJson.rowIndex = this.getRowIndex(row)
    },
    // 行双点击，仅在dialog中有效
    handleRowDbClick(row) {
      this.dataJson.tempJson = Object.assign({}, row) // copy obj
      this.dataJson.rowIndex = this.getRowIndex(row)
    },
    handleSearch() {
      // 查询
      this.dataJson.searchForm.pageCondition.current = 1
      this.getDataList()
      // 清空选择
      this.dataJson.multipleSelection = []
      this.$refs.multipleTable.clearSelection()
    },
    handleRowUpdate(row, _rowIndex) {
      // 修改
      this.dataJson.tempJson = Object.assign({}, row) // copy obj
      this.dataJson.rowIndex = _rowIndex
      this.popSettingsData.dialogStatus = 'update'
      this.popSettingsData.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataSubmitForm'].clearValidate()
      })
    },
    // 点击按钮 复制新增
    handleCopyInsert() {
      this.dataJson.tempJson = Object.assign({}, this.dataJson.currentJson)
      this.dataJson.tempJson.id = undefined
      this.dataJson.tempJson.template_id = undefined
      this.dataJson.tempJson.u_id = ''
      this.dataJson.tempJson.u_time = ''
      // 修改
      this.popSettingsData.dialogStatus = 'copyInsert'
      this.popSettingsData.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataSubmitForm'].clearValidate()
      })
      // 设置按钮
      this.popSettingsData.btnShowStatus.showInsert = false
      this.popSettingsData.btnShowStatus.showUpdate = false
      this.popSettingsData.btnShowStatus.showCopyInsert = true
      // 复制新增时focus
      this.$nextTick(() => {
        this.$refs['refFocus'].focus()
      })
    },
    handleCurrentChange(row) {
      this.dataJson.currentJson = Object.assign({}, row) // copy obj
      this.dataJson.currentJson.index = this.getRowIndex(row)
      this.dataJson.tempJsonOriginal = Object.assign({}, row) // copy obj

      if (this.dataJson.currentJson.id !== undefined) {
        // this.settings.btnShowStatus.doInsert = true
        this.settings.btnShowStatus.showUpdate = true
        this.settings.btnShowStatus.showCopyInsert = true
      } else {
        // this.settings.btnShowStatus.doInsert = false
        this.settings.btnShowStatus.showUpdate = false
        this.settings.btnShowStatus.showCopyInsert = false
      }
      // 设置dialog的返回
      this.$store.dispatch('popUpSearchDialog/selectedDataJson', Object.assign({}, row))
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
    getDataList(val) {
      // 通知兄弟组件
      this.$off('global:getDataList_loading')
      this.$emit('global:getDataList_loading')
      this.dataJson.searchForm.pageCondition.current = this.dataJson.paging.current
      this.dataJson.searchForm.pageCondition.size = this.dataJson.paging.size
      // 查询逻辑
      this.settings.listLoading = true
      const condition = { ...this.dataJson.searchForm.condition, ...{ pageCondition: this.dataJson.searchForm.pageCondition }}
      getPositionListApi(condition).then(response => {
        this.dataJson.listData = response.data.records
        this.dataJson.paging = response.data
        this.dataJson.paging.records = {}
        this.settings.listLoading = false
        // 通知兄弟组件
        this.$off('global:getDataList_loading_ok')
        this.$emit('global:getDataList_loading_ok')
      })
    },
    // 关闭弹出窗口
    handlCloseDialog() {
      this.popSettingsImport.dialogFormVisible = false
      this.popSettingsData.dialogFormVisible = false
    },
    // 获取row-key
    getRowKeys(row) {
      return row.id
    },
    // table选择框
    handleSelectionChange(val) {
      this.dataJson.multipleSelection = val
    },
    renderHeaderIsDel: function(h, { column }) {
      return (
        <span>{column.label}
          <el-tooltip
            class='item'
            effect='dark'
            placement='bottom'
          >
            <div slot='content'>
            删除状态提示：<br/>
            绿色：未删除  <br/>
            红色：已删除
            </div>
            <svg-icon icon-class='perfect-icon-question1_btn' style='margin-left: 5px'/>
          </el-tooltip>
        </span>
      )
    }
    // --------------弹出查询框：--------------

    // -------------------不同的页签，标签进行的验证------------------
  }
}
</script>
