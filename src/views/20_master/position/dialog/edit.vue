<template>
  <!-- pop窗口 数据编辑:新增、修改、步骤窗体-->
  <el-dialog
    v-if="listenVisible"
    v-el-drag-dialog
    :title="settings.textMap[settings.dialogStatus]"
    :visible="settings.dialogFormVisible"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :append-to-body="true"
    :modal-append-to-body="false"
    width="700px"
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
      <el-row v-show="settings.dialogStatus === 'update' || isViewModel">
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
        <el-button type="danger" :disabled="settings.listLoading || settings.btnDisabledStatus.disabledReset" @click="doReset()">重置</el-button>
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
    model: {
      type: String,
      default: constants_para.MODEL_VIEW
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
        tempJson: null,
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
        // 弹出窗口状态名称
        textMap: {
          view: '查看',
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
      },
      meDialogSetting: {
        program: this.$store.getters.program,
        selectedDataJson: this.$store.getters.selectedDataJson,
        dialogStatus: false,
        model: this.model
      }
    }
  },
  computed: {
    // 是否为更新模式
    isUpdateModel() {
      if (this.settings.dialogStatus === 'insert' || this.settings.dialogStatus === 'copyInsert') {
        return false
      } else {
        return true
      }
    },
    listenVisible() {
      return this.visible
    },
    isViewModel() {
      if (this.model === constants_para.MODEL_VIEW) {
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
        } else if (this.settings.dialogFormVisible) {
          // 有修改按钮高亮
          this.settings.btnDisabledStatus.disabledReset = false
          this.settings.btnDisabledStatus.disabledInsert = false
          this.settings.btnDisabledStatus.disabledUpdate = false
          this.settings.btnDisabledStatus.disabledCopyInsert = false
        }
      },
      deep: true
    },
    // 弹出窗口初始化，按钮不可用
    'settings.dialogFormVisible': {
      handler(newVal, oldVal) {
        if (this.settings.dialogFormVisible) {
          this.settings.btnDisabledStatus.disabledReset = true
          this.settings.btnDisabledStatus.disabledInsert = true
          this.settings.btnDisabledStatus.disabledUpdate = true
          this.settings.btnDisabledStatus.disabledCopyInsert = true
        }
      }
    }
  },
  created() {
    this.init()
  },
  mounted() { },
  methods: {
  }
}
</script>

