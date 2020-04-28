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
      <el-table-column type="index" width="45" label="No" />
      <el-table-column show-overflow-tooltip sortable="custom" min-width="150" :sort-orders="settings.sortOrders" prop="parent_simple_name" label="上级名称" />
      <el-table-column show-overflow-tooltip sortable="custom" min-width="130" :sort-orders="settings.sortOrders" prop="parent_type_text" label="上级类型" />
      <el-table-column show-overflow-tooltip sortable="custom" min-width="230" :sort-orders="settings.sortOrders" prop="code" label="岗位编号">
        <template slot-scope="scope">
          {{ scope.row.code }}
          <el-link type="primary" @click="handleEdit(scope.row.id)">
            编辑
          </el-link>
        </template>
      </el-table-column>

      <el-table-column show-overflow-tooltip min-width="130" prop="" label="操作">
        <template slot-scope="scope">
          <el-link type="primary" @click="handleEditStaffMember(scope.row.id, scope.row)">
            添加员工
          </el-link>
          <span>
            （
            <el-link type="primary" @click="handleViewStaffMember(scope.row.id, scope.row)">
              {{ scope.row.staff_count }}
            </el-link>
            ）
          </span>
        </template>
      </el-table-column>

      <el-table-column show-overflow-tooltip sortable="custom" min-width="150" :sort-orders="settings.sortOrders" prop="name" label="岗位名称" />
      <el-table-column show-overflow-tooltip sortable="custom" min-width="150" :sort-orders="settings.sortOrders" prop="simple_name" label="岗位简称" />
      <el-table-column show-overflow-tooltip min-width="150" prop="descr" label="描述" />
      <el-table-column min-width="70" :sort-orders="settings.sortOrders" label="删除" :render-header="renderHeaderIsDel">
        <template slot-scope="scope">
          <el-tooltip :content="scope.row.is_del === 'false' ? '删除状态：已删除' : '删除状态：未删除' " placement="top" :open-delay="500">
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

    <position-dialog
      v-if="popSettingsData.dialog.positionMaster.visible"
      :id="popSettingsData.searchDialogData.id"
      :visible="popSettingsData.dialog.positionMaster.visible"
      @closeMeOk="handlePositionCloseOk"
      @closeMeCancel="handlePositionCloseCancel"
    />

    <set-position-dialog
      v-if="popSettingsData.dialog.setPositionData.visible"
      :id="popSettingsData.dialog.setPositionData.props.id"
      :data="popSettingsData.dialog.setPositionData.props.data"
      :visible="popSettingsData.dialog.setPositionData.visible"
      :model="popSettingsData.dialog.setPositionData.props.model"
      @closeMeOk="handleSetPositionCloseOk"
      @closeMeCancel="handleSetPositionCloseCancel"
    />

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
  .transferCenter {
    display:flex;
    justify-content:center;
  }
</style>

<script>
import { getPositionListApi } from '@/api/20_master/org/org'
import Pagination from '@/components/Pagination'
import positionDialog from '@/views/20_master/position/dialog/dialog'
import setPositionDialog from '@/views/20_master/position/dialog/setPosistion'
import constants_para from '@/common/constants/constants_para'

export default {
  // name: 'P00000177', // 页面id，和router中的name需要一致，作为缓存
  components: { Pagination, positionDialog, setPositionDialog },
  directives: { },
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
        dialog: {
          // master弹出编辑页面
          positionMaster: {
            visible: false
          },
          // 设置数据页面
          setPositionData: {
            visible: false,
            props: {
              id: undefined,
              data: {},
              model: ''
            }
          }
        }
      }
    }
  },
  computed: {
  },
  // 监听器
  watch: {
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
    // 因为全局事件已经进行了查询，所以此处页面查询就不需要了
    // this.initShow()
  },
  mounted() {
    // 描绘完成
    this.$on(this.EMITS.EMIT_ORG_CHANGE, _data => {
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
      this.$off(this.EMITS.EMIT_ORG_CHANGE_LOADING)
      this.$emit(this.EMITS.EMIT_ORG_CHANGE_LOADING)
      this.dataJson.searchForm.pageCondition.current = this.dataJson.paging.current
      this.dataJson.searchForm.pageCondition.size = this.dataJson.paging.size
      // 查询逻辑
      this.settings.listLoading = true
      const condition = { ...this.dataJson.searchForm.condition, ...{ pageCondition: this.dataJson.searchForm.pageCondition }}
      getPositionListApi(condition).then(response => {
        this.dataJson.listData = response.data.records
        this.dataJson.paging = response.data
        this.dataJson.paging.records = {}
        // 通知兄弟组件
        this.$off(this.EMITS.EMIT_ORG_CHANGE_LOADING_OK)
        this.$emit(this.EMITS.EMIT_ORG_CHANGE_LOADING_OK)
      }).finally(() => {
        this.settings.listLoading = false
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
    },
    // ------------------岗位master弹出框--------------------
    handleEdit(val) {
      this.popSettingsData.dialog.positionMaster.visible = true
    },
    // 岗位：关闭对话框：确定
    handlePositionCloseOk(val) {
      this.settings.searchDialogData.selectedDataJson = val
      this.settings.searchDialogData.dialogVisible = false
      // 通知兄弟组件
      this.$off(this.EMITS.EMIT_ORG_LEFT)
      this.$emit(this.EMITS.EMIT_ORG_LEFT)
      // 查询数据并返回
    },
    // 岗位：关闭对话框：取消
    handlePositionCloseCancel() {
      this.settings.searchDialogData.dialogVisible = false
    },
    // ------------------岗位设置员工弹出框--------------------
    handleViewStaffMember(val, row) {
      this.popSettingsData.dialog.setPositionData.props.id = val
      this.popSettingsData.dialog.setPositionData.props.data = row
      this.popSettingsData.dialog.setPositionData.props.model = constants_para.MODEL_VIEW
      this.popSettingsData.dialog.setPositionData.visible = true
    },
    handleEditStaffMember(val, row) {
      this.popSettingsData.dialog.setPositionData.props.id = val
      this.popSettingsData.dialog.setPositionData.props.data = row
      this.popSettingsData.dialog.setPositionData.props.model = constants_para.MODEL_EDIT
      this.popSettingsData.dialog.setPositionData.visible = true
    },
    handleSetPositionCloseOk(val) {
      this.popSettingsData.dialog.setPositionData.visible = false
      // 通知兄弟组件
      this.$off(this.EMITS.EMIT_ORG_POSITION_UPDATED)
      this.$emit(this.EMITS.EMIT_ORG_POSITION_UPDATED, val)
    },
    handleSetPositionCloseCancel() {
      this.popSettingsData.dialog.setPositionData.visible = false
    }
  }
}
</script>
