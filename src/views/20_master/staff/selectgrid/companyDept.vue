<template>
  <div class="el-select">
    <el-input
      ref="refSelectGrid"
      v-popover:popover
      :placeholder="placeholder"
      readonly
      style="cursor:pointer"
      @click.native="handleClick"
      @keydown.native.enter.prevent="handleClick"
      @keydown.native.esc.stop.prevent="settings.visible = false"
      @keydown.native.tab="settings.visible = false"
    >
      <template slot="suffix">
        <i v-show="!showClose" :class="['el-select__caret', 'el-input__icon', 'el-icon-' + iconClass]" />
        <i v-if="showClose" class="el-select__caret el-input__icon el-icon-circle-close" @click="handleClearClick" />
      </template>
    </el-input>
    <el-popover
      ref="popover"
      v-model="settings.visible"
      :title="title"
      width="400"
      trigger="manual"
      popper-class="popper-class"
    >
      <el-container>
        <el-header>请选择{{ showTitle }}</el-header>
        <el-main>
          <el-input
            ref="refFocus"
            v-model="dataJson.filterText"
            class="filterInput"
            placeholder="输入关键字进行过滤"
            @keyup.enter.native="handleButtonSearch"
          >
            <el-button slot="append" ref="buttonSearch" icon="el-icon-search" class="buttonSearch" @click="handleButtonSearch" />
          </el-input>
          <div style="overflow-y:auto;overflow-x:auto;" class="mytree">
            <el-tree
              ref="treeObject"
              :data="dataJson.treeData"
              :props="dataJson.defaultProps"
              :filter-node-method="filterNode"
              :expand-on-click-node="false"
              :indent="0"
              highlight-current
              node-key="id"
              default-expand-all
              class="tree"
              @current-change="handleCurrentChange"
            >
              <span slot-scope="{ node, data }" class="custom-tree-node">
                <span>
                  <svg-icon v-if="data.type === '10'" icon-class="perfect-icon-tenant" class="el-icon--right" />
                  <svg-icon v-else-if="data.type === '20'" icon-class="perfect-icon-group" class="el-icon--right" />
                  <svg-icon v-else-if="data.type === '30'" icon-class="perfect-icon-company" class="el-icon--right" />
                  <svg-icon v-else-if="data.type === '40'" icon-class="perfect-icon-dept" class="el-icon--right" />
                  <svg-icon v-else-if="data.type === '50'" icon-class="perfect-icon-position" class="el-icon--right" />
                  {{ node.label }}
                </span>
                <span>[{{ data.type_text }}]</span>
              </span>
            </el-tree>
          </div>
        </el-main>
        <el-footer style="text-align:right">
          <el-divider />
          <div class="floatLeft">
            <el-button type="danger" @click="doReset()">重置</el-button>
          </div>
          <el-button plain :disabled="settings.listLoading" @click="settings.visible = false">取 消</el-button>
          <el-button plain :disabled="settings.listLoading || settings.btnDisabledStatus.disabledOk " @click="doOk()">确 定</el-button>
        </el-footer>
      </el-container>
    </el-popover>
  </div>
</template>

<style>
  .pointer_cursor {
    cursor:pointer
  }
  .popper-class{
    padding: 0;
  }
  .popper-class[x-placement^="bottom"] .popper__arrow::after {
    border-bottom-color: #115aa5;
  }
</style>

<style scoped>
  .floatRight {
    float: right;
  }
  .floatLeft {
    float: left;
  }
</style>

<style scoped>
.el-header {
  padding: 10px 10px 10px 10px;
  background: #115aa5;
  color: #fff;
  height: 100% !important;
}

.treeStyle {
  overflow: auto;
  border: 1px solid #ebeef5;
}
.filterInput {
  margin-bottom: 10px;
}

.leaf {
    width: 20px;
    background: #ddd
}

.folder {
    width: 20px;
    background: #888
}

.custom-tree-container {
    display: -ms-flexbox;
    display: flex;
    margin: -24px
}

.block {
    -ms-flex: 1;
    flex: 1;
    padding: 8px 24px 24px
}

.block>p {
    text-align: center;
    margin: 0;
    line-height: 4
}

.block:first-child {
    border-right: 1px solid #eff2f6
}

.custom-tree-node {
    -ms-flex: 1;
    flex: 1;
    display: -ms-flexbox;
    display: flex;
    -ms-flex-align: center;
    align-items: center;
    -ms-flex-pack: justify;
    justify-content: space-between;
    font-size: 14px;
    padding-right: 8px
}
.el-tree-node:focus > .el-tree-node__content {
  background-color: transparent !important;
}
</style>

<style lang="scss" scoped>
.mytree /deep/{
    .el-tree > .el-tree-node:after {
    border-top: none;
  }

  // .el-tree-node__content {
  //   margin-left: -20px;
  // }

  .el-tree-node {
    position: relative;
    padding-left: 2px;
  }
  //节点有间隙，隐藏掉展开按钮就好了,如果觉得空隙没事可以删掉
  .el-tree-node__expand-icon.is-leaf{
    // display: none;
    color: transparent;
    border-top: 1px solid #4386c6;
    height: 3px;
    top: 12px;
    width: 8px;
    margin-right: 8px;
  }
  .el-tree-node__children {
    padding-left: 20px;
  }

  .el-tree-node :last-child:before {
    height: 38px;
  }

  .el-tree > .el-tree-node:before {
    border-left: none;
  }

  .el-tree > .el-tree-node:after {
    border-top: none;
  }

  .el-tree-node:before {
    content: "";
    left: 2px;
    position: absolute;
    right: auto;
    border-width: 1px;
  }

  .el-tree-node:after {
    content: "";
    left: 2px;
    position: absolute;
    right: auto;
    border-width: 1px;
  }

  .el-tree-node:before {
    border-left: 1px solid #4386c6;
    bottom: 0px;
    height: 100%;
    top: -26px;
    width: 1px;
  }
  .el-icon--right {
    margin-left: 0px;
  }

  // .el-tree-node:after {
  //   border-top: 1px solid #4386c6;
  //   height: 20px;
  //   top: 12px;
  //   width: 8px;
  // }

  .el-tree>.el-tree-node{
    min-width:100%;
    display: inline-block ;
  }

  .el-tree-node__content>.el-tree-node__expand-icon {
    padding: 2px
  }
}

</style>

<style >
  .buttonSearch{
    color: #FFFFFF;
    background-color: #1890ff;
    border-color: #1890ff;
  }
</style>

<script>
import { getTreeListApi } from '@/api/20_master/org/org'

export default {
  name: 'SelectGrid', // 页面id，和router中的name需要一致，作为缓存
  components: { },
  mixins: [],
  props: {
    placeholder: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      dataJson: {
        // 下拉选项json
        selectOptions: [],
        filterText: '',
        treeData: [],
        // 单条数据 json
        currentJson: null,
        tempJson: {
          org_type: ''
        },
        tempJsonOriginal: null
      },
      settings: {
        isUpIcon: true,
        visible: false,
        para: this.CONSTANTS.DICT_ORG_SETTING_TYPE,
        filterPara: [],
        listLoading: true,
        // 按钮状态：是否可用
        btnDisabledStatus: {
          disabledOk: true
        },
        defaultProps: {
          children: 'children',
          label: 'label'
        }
      }
    }
  },
  computed: {
    showClose() {
      const hasValue = false
      return hasValue
    },
    iconClass() {
      return (this.settings.visible ? 'arrow-up is-reverse' : 'arrow-up')
    },
    showTitle() {
      switch (this.type) {
        case this.CONSTANTS.DICT_ORG_SETTING_TYPE_COMPANY:
          return '企业'
        case this.CONSTANTS.DICT_ORG_SETTING_TYPE_DEPT:
          return '部门'
        default:
          return ''
      }
    }
  },
  // 监听器
  watch: {
    'settings.visible': {
      handler(newVal, oldVal) {
        if (newVal) {
          // 显示popover
          this.settings.isUpIcon = true
          this.initCreated()
        } else {
          // 隐藏popover
          this.settings.isUpIcon = false
        }
      },
      immediate: true
    },
    'settings.listLoading': {
      handler(newVal, oldVal) {
        switch (newVal) {
          case true:
            this.showLoading('正在查询，请稍后...')
            break
          case false:
            this.closeLoading()
            break
        }
      }
    }
  },
  created() {
    // 页面初始化
    this.initCreated()
    // 点击其他不在的区域触发事件
    document.addEventListener('click', (e) => {
      if (this.settings.visible !== false) {
        if (!this.$el.contains(e.target)) {
          this.settings.visible = false
        }
      }
    })
  },
  mounted() {
    // 描绘完成
    const originalClass = this.$refs['refSelectGrid'].$el.children[0].className
    const newClass = originalClass + ' , pointer_cursor '
    this.$refs['refSelectGrid'].$el.children[0].className = newClass
  },
  methods: {
    // 页面初始化
    initCreated() {
      // 初始化
      this.dataJson = {
        // 下拉选项json
        selectOptions: [],
        filterText: '',
        treeData: [],
        // 单条数据 json
        currentJson: null,
        tempJson: {
          org_type: ''
        },
        tempJsonOriginal: null
      }
      this.settings.btnDisabledStatus.disabledOk = true
      // 展开时，调用查询
      this.getDataList()
      // 控件focus
      this.$nextTick(() => {
        this.$refs['refFocus'].focus()
      })
    },
    // 单击事件
    handleClick() {
      this.settings.visible = !this.settings.visible
    },
    doDestroy() {
      this.$refs.popper && this.$refs.popper.doDestroy()
    },
    handleClearClick(event) {
    },
    handleButtonSearch() {
      // 查询
      this.getDataList()
    },
    getDataList() {
      if (this.settings.visible === false) {
        return
      }
      // 查询逻辑
      this.settings.listLoading = true
      getTreeListApi(this.dataJson.searchForm).then(response => {
        this.dataJson.treeData = response.data
        this.getListAfterProcess()
        this.settings.listLoading = false
        this.$nextTick(() => {
          let current_node = null
          if (this.dataJson.currentJson === null) {
            current_node = this.dataJson.treeData[0]
            this.$refs.treeObject.setCurrentKey(this.dataJson.treeData[0].id)
            this.$refs.treeObject.getCurrentNode(current_node)
          } else {
            current_node = this.dataJson.currentJson
            this.$refs.treeObject.setCurrentKey(this.dataJson.currentJson.currentkey)
            this.$refs.treeObject.getCurrentNode(current_node)
          }
        })
      })
    },
    filterNode(value, data) {
      if (!value) return true
      return data.label.indexOf(value) !== -1
    },
    // 查询后处理
    getListAfterProcess() {
      if (Object.keys(this.dataJson.filterText).length !== 0) {
        this.$nextTick(() => {
          this.$refs.treeObject.filter(this.dataJson.filterText)
        })
      }
    },
    // 点击确定按钮
    doOk() {
      this.settings.visible = false
    },
    // 当前选中节点变化时触发的事件
    handleCurrentChange(row) {
      this.dataJson.currentJson = Object.assign({}, row) // copy obj
      this.dataJson.tempJsonOriginal = Object.assign({}, row) // copy obj
      this.dataJson.tempJson = Object.assign({}, row) // copy obj
      this.dataJson.currentJson = this.$refs.treeObject.getCurrentNode()
      this.dataJson.currentJson.currentkey = this.$refs.treeObject.getCurrentKey()
      this.settings.btnDisabledStatus.disabledOk = true
      if (this.type === this.dataJson.currentJson.type) {
        this.settings.btnDisabledStatus.disabledOk = false
      }
    },
    // 重置
    doReset() {
      this.initCreated()
    }
  }
}
</script>
