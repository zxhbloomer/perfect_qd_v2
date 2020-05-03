<template>
  <!-- pop窗口 数据编辑:新增、修改、步骤窗体-->
  <el-dialog
    v-if="listenVisible"
    v-el-drag-dialog
    v-loading="settings.listLoading"
    element-loading-text="拼命加载中，请稍后..."
    element-loading-background="rgba(255, 255, 255, 0.7)"
    :title="PARAMETERS.STATUS_TEXT_MAP[dialogStatus]"
    :visible="visible"
    :close-on-click-modal="PARAMETERS.DIALOG_CLOSE_BY_CLICK"
    :close-on-press-escape="PARAMETERS.DIALOG_CLOSE_BY_ESC"
    :show-close="false"
    :append-to-body="true"
    :modal-append-to-body="true"
    width="700px"
    destroy-on-close
  >
    <el-form
      ref="dataSubmitForm"
      :rules="settings.rules"
      :model="dataJson.tempJson"
      label-position="rigth"
      label-width="120px"
      status-icon
    >
      <el-alert
        title="基本信息"
        type="info"
        :closable="false"
      />
      <br>

      <el-row>
        <el-col :span="12">
          <el-form-item label="岗位编号：" prop="code">
            <el-input ref="refFocus" v-model.trim="dataJson.tempJson.code" clearable show-word-limit :maxlength="dataJson.inputSettings.maxLength.code" :disabled="isUpdateModel" :placeholder="isPlaceholderShow('请输入')" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="岗位名称：" prop="name">
            <el-input ref="refUpdateFocus" v-model.trim="dataJson.tempJson.name" clearable show-word-limit :maxlength="dataJson.inputSettings.maxLength.name" :placeholder="isPlaceholderShow('请输入')" :disabled="isViewModel" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="12">
          <el-form-item label="岗位简称：" prop="simple_name">
            <el-input v-model.trim="dataJson.tempJson.simple_name" clearable show-word-limit :maxlength="dataJson.inputSettings.maxLength.code" :placeholder="isPlaceholderShow('请输入')" :disabled="isViewModel" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="描述：" prop="descr">
        <el-input v-model.trim="dataJson.tempJson.descr" clearable type="textarea" show-word-limit :maxlength="dataJson.inputSettings.maxLength.descr" :placeholder="isPlaceholderShow('请输入')" :disabled="isViewModel" />
      </el-form-item>
      <el-row v-show="dialogStatus === PARAMETERS.STATUS_UPDATE || isViewModel">
        <el-col :span="12">
          <el-form-item label="更新人：" prop="u_name">
            <el-input v-model.trim="dataJson.tempJson.u_name" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="更新时间：" prop="u_time">
            <el-input v-model.trim="dataJson.tempJson.u_time" disabled />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-divider />
      <div class="floatLeft">
        <el-button v-show="!isViewModel" type="danger" :disabled="settings.listLoading || settings.btnDisabledStatus.disabledReset" @click="doReset()">重置</el-button>
      </div>
      <el-button plain :disabled="settings.listLoading" @click="handleCancel()">取消</el-button>
      <el-button v-show="settings.btnShowStatus.showInsert" plain type="primary" :disabled="settings.listLoading || settings.btnDisabledStatus.disabledInsert " @click="doInsert()">确定</el-button>
      <el-button v-show="settings.btnShowStatus.showUpdate" plain type="primary" :disabled="settings.listLoading || settings.btnDisabledStatus.disabledUpdate " @click="doUpdate()">确定</el-button>
      <el-button v-show="settings.btnShowStatus.showCopyInsert" plain type="primary" :disabled="settings.listLoading || settings.btnDisabledStatus.disabledCopyInsert " @click="doCopyInsert()">确定</el-button>
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
  .el-form-item .el-select {
    width: 100%;
  }
</style>

<script>

import constants_para from '@/common/constants/constants_para'
import elDragDialog from '@/directive/el-drag-dialog'
import { updateApi, insertApi } from '@/api/20_master/position/position'
import deepCopy from 'utils-copy'

export default {
  // name: '', // 页面id，和router中的name需要一致，作为缓存
  components: { },
  directives: { elDragDialog },
  mixins: [],
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    id: {
      type: Number,
      default: null
    },
    data: {
      type: Object,
      default: null
    },
    dialogStatus: {
      type: String,
      default: constants_para.STATUS_VIEW
    }
  },
  data() {
    return {
      dataJson: {
        // 单条数据 json的，初始化原始数据
        tempJsonOriginal: {
          id: undefined,
          name: '',
          code: '',
          descr: '',
          dbversion: 0
        },
        // 单条数据 json
        tempJson: deepCopy(this.data),
        inputSettings: {
          maxLength: {
            name: 20,
            code: 20,
            descr: 200,
            simple_name: 20
          }
        }
      },
      settings: {
        // loading 状态
        listLoading: true,
        // 按钮是否显示，默认不显示，false：不显示，true：显示
        btnShowStatus: {
          showInsert: false,
          showUpdate: false,
          showCopyInsert: false
        },
        // 按钮状态：是否可用，false:可用，true不可用
        btnDisabledStatus: {
          disabledReset: true,
          disabledInsert: true,
          disabledUpdate: true,
          disabledCopyInsert: true
        },
        // 重置按钮点击后
        btnResetStatus: false,
        // 以下为pop的内容：数据弹出框
        selection: [],
        dialogStatus: this.dialogStatus,
        // pop的check内容
        rules: {
          name: [{ required: true, message: '请输入岗位名称', trigger: 'change' }],
          // code: [{ required: true, message: '请输入岗位编号', trigger: 'change' }],
          simple_name: [{ required: true, message: '请输入岗位简称', trigger: 'change' }]
        },
        // --------岗位设置弹出框---------
        dialogPositionVisible: false,
        // 穿梭框
        transfer: {
          position_id: null,
          // 所有staff
          staff_all: [],
          staff_positions: [],
          old_staff_positions: [],
          current_row: null
        },
        // 弹出框title，岗位名称
        position_title: ''
      }
    }
  },
  computed: {
    // 是否为更新模式
    isUpdateModel() {
      if (this.settings.dialogStatus === this.PARAMETERS.STATUS_INSERT || this.settings.dialogStatus === this.PARAMETERS.STATUS_COPY_INSERT) {
        return false
      } else {
        return true
      }
    },
    listenVisible() {
      return this.visible
    },
    isViewModel() {
      if (this.settings.dialogStatus === this.PARAMETERS.STATUS_VIEW) {
        return true
      } else {
        return false
      }
    }
  },
  // 监听器
  watch: {
    // 监听页面上面是否有修改，有修改按钮高亮
    'dataJson.tempJson': {
      handler(newVal, oldVal) {
        if (this.settings.btnResetStatus === true) {
          // 点击了重置按钮
          this.settings.btnDisabledStatus.disabledReset = true
          this.settings.btnDisabledStatus.disabledInsert = true
          this.settings.btnDisabledStatus.disabledUpdate = true
          this.settings.btnDisabledStatus.disabledCopyInsert = true
          this.settings.btnResetStatus = false
        } else if (this.visible) {
          // 有修改按钮高亮
          this.settings.btnDisabledStatus.disabledReset = false
          this.settings.btnDisabledStatus.disabledInsert = false
          this.settings.btnDisabledStatus.disabledUpdate = false
          this.settings.btnDisabledStatus.disabledCopyInsert = false
        }
      },
      deep: true
    }
  },
  created() {
    this.init()
  },
  mounted() { },
  methods: {
    // 初始化处理
    init() {
      this.initButton()
      switch (this.dialogStatus) {
        case this.PARAMETERS.STATUS_INSERT:
          this.initInsertModel()
          break
        case this.PARAMETERS.STATUS_UPDATE:
          this.initUpdateModel()
          break
        case this.PARAMETERS.STATUS_COPY_INSERT:
          this.initCopyInsertModel()
          break
        case this.PARAMETERS.STATUS_VIEW:
          this.initViewModel()
          break
      }
      this.settings.listLoading = false
    },
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
    initButton() {
      // 初始化按钮状态
      this.settings.btnShowStatus = this.$options.data.call(this).settings.btnShowStatus
      this.settings.btnDisabledStatus = this.$options.data.call(this).settings.btnDisabledStatus
    },
    // 新增时的初始化
    initInsertModel() {
      // 数据初始化
      this.initTempJsonOriginal()
      this.dataJson.tempJson = Object.assign({}, this.dataJson.tempJsonOriginal)
      // 设置按钮
      this.settings.btnShowStatus.showInsert = true
      // 控件focus
      this.$nextTick(() => {
        this.$refs['refFocus'].focus()
      })
    },
    // 复制新增时的初始化
    initCopyInsertModel() {
      // 设置按钮
      this.settings.btnShowStatus.showCopyInsert = true
      // 控件focus
      this.$nextTick(() => {
        this.$refs['refFocus'].focus()
      })
    },
    // 修改时的初始化
    initUpdateModel() {
      // 设置按钮
      this.settings.btnShowStatus.showUpdate = true
      // 控件focus
      this.$nextTick(() => {
        this.$refs['refUpdateFocus'].focus()
      })
    },
    // 查看时的初始化
    initViewModel() {
    },
    // Placeholder设置
    isPlaceholderShow(val) {
      if (this.isViewModel) {
        return ''
      } else {
        return val
      }
    },
    // 取消按钮
    handleCancel() {
      this.$emit('closeMeCancel')
    },
    // 重置按钮
    doReset() {
      this.popSettingsData.btnResetStatus = true
      switch (this.popSettingsData.dialogStatus) {
        case 'update':
          // 数据初始化
          this.dataJson.tempJson = Object.assign({}, this.dataJson.tempJsonOriginal)
          // 设置控件焦点focus
          this.$nextTick(() => {
            this.$refs['refFocus'].focus()
          })
          break
        default:
          // 数据初始化
          this.dataJson.tempJson = Object.assign({}, this.dataJson.tempJsonOriginal)
          // 设置控件焦点focus
          this.$nextTick(() => {
            this.$refs['refFocus'].focus()
          })
          break
      }

      // 去除validate信息
      this.$nextTick(() => {
        this.$refs['dataSubmitForm'].clearValidate()
      })
    },
    // 插入逻辑
    doInsert() {
      this.$refs['dataSubmitForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.dataJson.tempJson)
          this.settings.listLoading = true
          insertApi(tempData).then((_data) => {
            this.$emit('closeMeOk', { return_flag: true, data: _data })
          }, (_error) => {
            this.$emit('closeMeOk', { return_flag: false, error: _error })
          }).finally(() => {
            this.settings.listLoading = false
          })
        }
      })
    },
    // 更新逻辑
    doUpdate() {
      this.$refs['dataSubmitForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.dataJson.tempJson)
          this.settings.listLoading = true
          updateApi(tempData).then((_data) => {
            this.dataJson.tempJson = Object.assign({}, _data.data)
            this.$emit('closeMeOk', { return_flag: true, data: _data })
          }, (_error) => {
            this.$emit('closeMeOk', { return_flag: false, error: _error })
          }).finally(() => {
            this.settings.listLoading = false
          })
        }
      })
    },
    // 复制新增逻辑
    doCopyInsert() {
      this.$refs['dataSubmitForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.dataJson.tempJson)
          this.settings.listLoading = true
          insertApi(tempData).then((_data) => {
            this.dataJson.tempJson = Object.assign({}, _data.data)
            this.$emit('closeMeOk', { return_flag: true, data: _data })
          }, (_error) => {
            this.$emit('closeMeOk', { return_flag: false, error: _error })
          }).finally(() => {
            this.settings.listLoading = false
          })
        }
      })
    }
  }
}
</script>

