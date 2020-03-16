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

      <el-table-column show-overflow-tooltip min-width="130" prop="" label="人员">
        <template slot-scope="scope">
          <el-link type="primary" @click="handleEditStaffMember(scope.row.id, scope.row)">
            设置
          </el-link>
          <span>
            （
            <el-link type="primary" @click="handleEdit(scope.row.id)">
              {{ scope.row.staff_count }}
            </el-link>
            ）
          </span>
        </template>
      </el-table-column>

      <el-table-column show-overflow-tooltip sortable="custom" min-width="150" :sort-orders="settings.sortOrders" prop="name" label="岗位全称" />
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

    <el-dialog
      v-el-drag-dialog
      title="维护岗位成员"
      :visible="popSettingsData.dialogFormVisible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
      :append-to-body="true"
      :modal-append-to-body="false"
      width="740px"
    >
      <el-form
        ref="dataSubmitForm"
        :model="dataJson.tempJson"
        label-position="rigth"
        label-width="120px"
        status-icon
      >
        <el-row>
          <el-col :span="24" class="transferCenter">
            <el-transfer
              v-model="popSettingsData.transfer.staff_positions"
              filterable
              :filter-method="transferFilterMethod"
              filter-placeholder="请输入城市拼音"
              :data="popSettingsData.transfer.staff_all"
              :titles="['未选择人员', '已选择人员']"
              :button-texts="['人员反选', '选择人员']"
              :render-content="renderTransfer"
            />
          </el-col>
        </el-row>

        <!-- <el-row v-show="popSettingsData.dialogStatus === 'update'">
          <el-col :span="12">
            <el-form-item label="更新者：" prop="u_id">
              <el-input v-model.trim="dataJson.tempJson.u_id" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="更新时间：" prop="u_time">
              <el-input v-model.trim="dataJson.tempJson.u_time" disabled />
            </el-form-item>
          </el-col>
        </el-row> -->
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-divider />
        <div class="floatLeft">
          <el-button type="danger" :disabled="settings.listLoading || popSettingsData.btnDisabledStatus.disabledReset" @click="doReset()">重置</el-button>
        </div>
        <el-button plain :disabled="settings.listLoading" @click="handleCancel()">取 消</el-button>
        <el-button v-show="popSettingsData.btnShowStatus.showInsert" plain type="primary" :disabled="settings.listLoading || popSettingsData.btnDisabledStatus.disabledInsert " @click="doInsert()">确 定</el-button>
        <el-button v-show="popSettingsData.btnShowStatus.showUpdate" plain type="primary" :disabled="settings.listLoading || popSettingsData.btnDisabledStatus.disabledUpdate " @click="doUpdate()">确 定</el-button>
        <el-button v-show="popSettingsData.btnShowStatus.showCopyInsert" plain type="primary" :disabled="settings.listLoading || popSettingsData.btnDisabledStatus.disabledCopyInsert " @click="doCopyInsert()">确 定</el-button>
      </div>
    </el-dialog>

    <position-dialog
      v-if="popSettingsData.searchDialogData.dialogVisible"
      :id="popSettingsData.searchDialogData.id"
      :visible="popSettingsData.searchDialogData.dialogVisible"
      @closeMeOk="handlePositionCloseOk"
      @closeMeCancel="handlePositionCloseCancel"
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

<style>
/*
  .el-transfer .el-transfer-panel {
    height: 500px;
  }
  */
</style>

<script>
import { getPositionListApi, getStaffTransferListApi, setStaffTransferApi } from '@/api/20_master/org/org'
import elDragDialog from '@/directive/el-drag-dialog'
import Pagination from '@/components/Pagination'
import positionDialog from '@/views/20_master/position/dialog/dialog'
import deepcopy from 'deepcopy'

export default {
  name: 'P00000177', // 页面id，和router中的name需要一致，作为缓存
  components: { Pagination, positionDialog },
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
        // 弹出的搜索框参数设置
        searchDialogData: {
          // 弹出框显示参数
          dialogVisible: false,
          // 点击确定以后返回的值
          selectedDataJson: {},
          // 传参
          id: ''
        },
        // 穿梭框
        transfer: {
          position_id: null,
          // 所有staff
          staff_all: [],
          staff_positions: [],
          old_staff_positions: [],
          current_row: null
        }
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
    // 'dataJson.tempJson': {
    //   handler(newVal, oldVal) {
    //     if (this.popSettingsData.btnResetStatus === true) {
    //       // 点击了重置按钮
    //       this.popSettingsData.btnDisabledStatus.disabledReset = true
    //       this.popSettingsData.btnDisabledStatus.disabledInsert = true
    //       this.popSettingsData.btnDisabledStatus.disabledUpdate = true
    //       this.popSettingsData.btnDisabledStatus.disabledCopyInsert = true
    //       this.popSettingsData.btnResetStatus = false
    //     } else if (this.popSettingsData.dialogFormVisible) {
    //       // 有修改按钮高亮
    //       this.popSettingsData.btnDisabledStatus.disabledReset = false
    //       this.popSettingsData.btnDisabledStatus.disabledInsert = false
    //       this.popSettingsData.btnDisabledStatus.disabledUpdate = false
    //       this.popSettingsData.btnDisabledStatus.disabledCopyInsert = false
    //     }
    //   },
    //   deep: true
    // },
    // 弹出窗口初始化，按钮不可用
    'popSettingsData.dialogFormVisible': {
      handler(newVal, oldVal) {
        if (this.popSettingsData.dialogFormVisible) {
          // 显示穿梭框
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
    },
    // 穿梭框的数据变动，设置重置和确定
    'popSettingsData.transfer.staff_positions': {
      handler(newVal, oldVal) {
        const listA = newVal
        const listB = this.popSettingsData.transfer.old_staff_positions
        // 如果新值，旧值为undefined 则return
        if (listA === undefined || listB === undefined) {
          this.popSettingsData.btnDisabledStatus.disabledReset = true
          return
        }
        const result = listA.length === listB.length && listA.every(a => listB.some(b => a === b)) && listB.every(_b => listA.some(_a => _a === _b))
        if (result) {
          // 未改变值
          this.popSettingsData.btnDisabledStatus.disabledReset = true
          this.popSettingsData.btnDisabledStatus.disabledInsert = true
        } else {
          // 有改变值
          this.popSettingsData.btnDisabledStatus.disabledReset = false
          this.popSettingsData.btnDisabledStatus.disabledInsert = false
        }
      },
      deep: true
    }
  },
  created() {
    // 因为全局事件已经进行了查询，所以此处页面查询就不需要了
    // this.initShow()
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
    },
    // --------------弹出查询框：--------------
    // -------------------不同的页签，标签进行的验证------------------
    // 岗位：关闭对话框：确定
    handlePositionCloseOk(val) {
      this.popSettingsData.searchDialogData.selectedDataJson = val
      this.popSettingsData.searchDialogData.dialogVisible = false
      // 通知兄弟组件
      this.$off('global:getDataListLeft')
      this.$emit('global:getDataListLeft')
      // 查询数据并返回
    },
    // 岗位：关闭对话框：取消
    handlePositionCloseCancel() {
      this.popSettingsData.searchDialogData.dialogVisible = false
    },
    // 编辑按钮
    handleEdit(val) {
      this.popSettingsData.searchDialogData.dialogVisible = true
      this.popSettingsData.searchDialogData.id = val
    },
    // 编辑岗位成员
    handleEditStaffMember(val, row) {
      // 初始化数据
      this.popSettingsData.transfer = {
        position_id: null,
        // 所有staff
        staff_all: [],
        staff_positions: [],
        old_staff_positions: [],
        current_row: row
      }
      this.popSettingsData.dialogFormVisible = true
      this.popSettingsData.btnShowStatus.showInsert = true
      this.popSettingsData.transfer.position_id = val
      getStaffTransferListApi(this.popSettingsData.transfer).then(response => {
        this.popSettingsData.transfer.staff_all = response.data.staff_all
        this.popSettingsData.transfer.staff_positions = response.data.staff_positions
        this.popSettingsData.transfer.old_staff_positions = deepcopy(response.data.staff_positions)
        this.settings.listLoading = false
      })
      this.popSettingsData.btnDisabledStatus.disabledReset = true
    },
    // 穿梭框的过滤方法
    transferFilterMethod(query, item) {
      return item.label.indexOf(query) > -1
    },
    handleCancel() {
      this.popSettingsData.dialogFormVisible = false
    },
    // 重置按钮
    doReset() {
      this.popSettingsData.btnResetStatus = true
      this.handleEditStaffMember(this.popSettingsData.transfer.position_id)
    },
    // 插入逻辑：岗位成员维护，点击确定按钮
    doInsert() {
      setStaffTransferApi(this.popSettingsData.transfer).then((_data) => {
        this.settings.listLoading = true
        this.popSettingsData.transfer.current_row.staff_count = _data.data.staff_positions_count
        this.$notify({
          title: '更新成功',
          message: _data.message,
          type: 'success',
          duration: this.settings.duration
        })
        this.popSettingsData.dialogFormVisible = false
        this.settings.listLoading = false
      }, (_error) => {
        this.$notify({
          title: '更新错误',
          message: _error.message,
          type: 'error',
          duration: this.settings.duration
        })
        // this.popSettingsData.dialogFormVisible = false
        this.settings.listLoading = false
      })
    },
    // 点击跳转到组织机构页面，并关闭本页面
    handleForward(val) {
      this.$confirm('查看该员工详情，需要关闭当前页面，请注意保存！', '确认信息', {
      }).then(() => {
        // 通知路由，打开组织机构页面
        this.$router.push({ name: this.PROGRAMS.P_STAFF, params: { name: val }})
        this.popSettingsData.dialogFormVisible = false
      }).catch(action => {

      })
    },
    // 穿梭框增加按钮
    renderTransfer(h, option) {
      return (
        // h('span',
        //   option.label,
        //   h('el-button',
        //     {
        //       props: {
        //         type: 'primary',
        //         icon: 'el-icon-edit',
        //         style: 'padding:7px 7px; float: right'
        //       },
        //       on: { click: this.save }
        //     }
        //   )
        // )
        <span>
          { option.label }
          <el-button type='primary' icon='el-icon-edit' plain style='padding:7px 7px; float: right' on-click={() => this.handleForward('123')} />
        </span>
      )
    }
  }
}
</script>
