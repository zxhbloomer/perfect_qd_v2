<template>
  <div>
    <!-- <el-form>
      <el-form-item>
        <el-button-group>
          <el-button type="primary" icon="el-icon-circle-plus-outline" :loading="settings.listLoading" @click="handleInsert">新增</el-button>
          <el-button :disabled="!settings.btnShowStatus.showUpdate" type="primary" icon="el-icon-edit-outline" :loading="settings.listLoading" @click="handleUpdate">修改</el-button>
          <el-button :disabled="!settings.btnShowStatus.showCopyInsert" type="primary" icon="el-icon-edit-outline" :loading="settings.listLoading" @click="handleCopyInsert">复制新增</el-button>
        </el-button-group>
      </el-form-item>
    </el-form> -->
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
      <el-table-column show-overflow-tooltip sortable="custom" min-width="230" :sort-orders="settings.sortOrders" prop="code" label="社会信用代码">
        <template slot-scope="scope">
          {{ scope.row.code }}
          <el-link type="primary" @click="handleEdit(scope.row.id)">
            编辑
          </el-link>
        </template>
      </el-table-column>
      <el-table-column show-overflow-tooltip sortable="custom" min-width="150" :sort-orders="settings.sortOrders" prop="name" label="企业全称" />
      <el-table-column show-overflow-tooltip sortable="custom" min-width="120" :sort-orders="settings.sortOrders" prop="simple_name" label="企业简称" />
      <el-table-column show-overflow-tooltip sortable="custom" min-width="120" :sort-orders="settings.sortOrders" prop="juridical_name" label="法定代表人" />
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

    <company-dialog
      v-if="popSettingsData.searchDialogData.dialogVisible"
      :id="popSettingsData.searchDialogData.id"
      :visible="popSettingsData.searchDialogData.dialogVisible"
      @closeMeOk="handleCompanyCloseOk"
      @closeMeCancel="handleCompanyCloseCancel"
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
</style>
<style >
  .el-input-group__append_select{
    color: #FFFFFF;
    background-color: #1890ff;
    border-color: #1890ff;
  }
  .el-input-group__append_reset{
    color: #FFFFFF;
    background-color: #F56C6C;
    border-color: #F56C6C;
  }
</style>

<script>
import { getCompanyListApi } from '@/api/20_master/org/org'
import { getDataByIdApi } from '@/api/20_master/address/address'
import elDragDialog from '@/directive/el-drag-dialog'
import Pagination from '@/components/Pagination'
import companyDialog from '@/views/20_master/company/dialog/dialog'

export default {
  name: 'P00000175', // 页面id，和router中的name需要一致，作为缓存
  components: { Pagination, companyDialog },
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
        rules: {},
        // 基本信息栏目check
        rulesOne: {
          code: [{ required: true, message: '请输入社会信用代码', trigger: 'change' }],
          name: [{ required: true, message: '请输入企业全称', trigger: 'change' }],
          simple_name: [{ required: true, message: '请输入企业简称', trigger: 'change' }],
          juridical_name: [{ required: true, message: '请输入法定代表人', trigger: 'change' }],
          register_capital: [{ required: true, message: '请输入注册资本（万）', trigger: 'change' }],
          type: [{ required: true, message: '请选择企业类型', trigger: 'change' }],
          setup_date: [
            { required: true, message: '请输入成立日期', trigger: 'change' },
            { validator: this.validateSetup_date, trigger: 'change' }
          ],
          end_date: [
            { required: true, message: '请输入营业有效期', trigger: 'change' },
            { validator: this.validateEnd_date, trigger: 'change' }
          ]
        },
        rules_disable: {
          // 默认可用
          end_date: false
        },
        // 错误数目
        badge: {
          countOne: 0,
          countTwo: 0,
          countThree: 0,
          countFour: 0
        },
        // 弹出的搜索框参数设置
        searchDialogData: {
          // 弹出框显示参数
          dialogVisible: false,
          // 点击确定以后返回的值
          selectedDataJson: {},
          // 传参
          id: ''
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
    },
    'popSettingsData.searchDialogData.selectedDataJson': {
      handler(newVal, oldVal) {
        if (newVal !== {}) {
          this.dataJson.tempJson.address_id = this.popSettingsData.searchDialogData.selectedDataJson.id
        } else {
          this.popSettingsData.searchDialogData.selectedDataJson.id = undefined
        }
      }
    }
  },
  created() {
    this.initShow()
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
        dbversion: 0,
        register_capital: 0
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
      // reset所有验证
      this.doResetValidate()
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
      getCompanyListApi(condition).then(response => {
        this.dataJson.listData = response.data.records
        this.dataJson.paging = response.data
        this.dataJson.paging.records = {}
        this.settings.listLoading = false
        // 通知兄弟组件
        this.$off(this.EMITS.EMIT_ORG_CHANGE_LOADING_OK)
        this.$emit(this.EMITS.EMIT_ORG_CHANGE_LOADING_OK)
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
    // 选择or重置按钮的初始化
    initAddressSelectButton() {
      this.$nextTick(() => {
        this.$refs.selectOne.$el.parentElement.className = 'el-input-group__append el-input-group__append_select'
      })
    },
    handleModuleDialogClick() {
      // 选择按钮
      this.popSettingsData.searchDialogData.dialogVisible = true
    },
    // 关闭对话框：确定
    handleAddressCloseOk(val) {
      this.popSettingsData.searchDialogData.selectedDataJson = val
      this.popSettingsData.searchDialogData.dialogVisible = false
      this.initAddressSelectButton()
    },
    // 关闭对话框：取消
    handleAddressCloseCancel() {
      this.popSettingsData.searchDialogData.dialogVisible = false
    },
    // -------------------不同的页签，标签进行的验证------------------
    // 所有的数据开始validate
    doValidateAllRules() {
      this.popSettingsData.rules = { ...this.popSettingsData.rulesOne }
      this.$refs['dataSubmitForm'].rules = this.popSettingsData.rules
    },
    // 开始综合验证
    doValidateByTabs() {
      // 第一个tabs
      this.popSettingsData.rules = this.popSettingsData.rulesOne
      this.$refs['dataSubmitForm'].rules = this.popSettingsData.rules
      this.$refs['dataSubmitForm'].validate((valid, validateItems) => {
        if (valid === false) {
          this.popSettingsData.badge.countOne = Object.keys(validateItems).length
        }
      })

      // 第二个tabs

      // 所有的数据进行验证
      this.doValidateAllRules()
    },
    // reset所有验证
    doResetValidate() {
      this.popSettingsData.badge.countOne = 0
      this.popSettingsData.badge.countTwo = 0
      this.$nextTick(() => {
        this.$refs['dataSubmitForm'].clearValidate()
        this.doValidateAllRules()
      })
    },
    // 营业有效期长期
    handleLongTermChange(val) {
      if (val) {
        // 营业有效期 不可用
        this.popSettingsData.rules_disable.end_date = true
        this.dataJson.tempJson.end_date = '9999/01/01'
      } else {
        this.popSettingsData.rules_disable.end_date = false
        this.dataJson.tempJson.end_date = ''
      }
    },
    // -------------------验证部分------------------
    // 营业有效期需要大于成立日期
    validateSetup_date(rule, value, callback) {
      const _data = Date.parse(value)
      if (!isNaN(Date.parse(value))) {
        if (_data > Date.parse(this.dataJson.tempJson.end_date)) {
          return callback(new Error('输入的营业有效期应大于成立日期'))
        }

        return callback()
      }
    },
    validateEnd_date(rule, value, callback) {
      const _data = Date.parse(value)
      if (!isNaN(Date.parse(value))) {
        if (_data <= Date.parse(this.dataJson.tempJson.setup_date)) {
          return callback(new Error('输入的营业有效期应大于成立日期'))
        }
        return callback()
      }
    },
    handleSetup_dateChange() {
      this.$refs.dataSubmitForm.validateField('setup_date')
      this.$refs.dataSubmitForm.validateField('end_date')
    },
    handleEnd_dateChange() {
      this.$refs.dataSubmitForm.validateField('setup_date')
      this.$refs.dataSubmitForm.validateField('end_date')
    },
    getAddressDataByid() {
      getDataByIdApi({ id: this.dataJson.tempJson.address_id }).then(response => {
        this.popSettingsData.searchDialogData.selectedDataJson = Object.assign({}, response.data)
      })
    },
    // --------------弹出查询框：开始--------------
    // 企业：关闭对话框：确定
    handleCompanyCloseOk(val) {
      this.popSettingsData.searchDialogData.selectedDataJson = val
      this.popSettingsData.searchDialogData.dialogVisible = false
      // 通知兄弟组件
      this.$off(this.EMITS.EMIT_ORG_LEFT)
      this.$emit(this.EMITS.EMIT_ORG_LEFT)
      // 查询数据并返回
    },
    // 企业：关闭对话框：取消
    handleCompanyCloseCancel() {
      this.popSettingsData.searchDialogData.dialogVisible = false
    },
    // 编辑按钮
    handleEdit(val) {
      this.popSettingsData.searchDialogData.dialogVisible = true
      this.popSettingsData.searchDialogData.id = val
    }
  }
}
</script>
