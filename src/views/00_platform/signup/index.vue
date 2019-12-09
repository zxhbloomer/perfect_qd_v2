<template>
  <div class="login-container">

    <div class="header">
      <div class="clearfix">
        <a href="https://www.jd.com" class="logo " />
        <div class="logo-title">企业注册</div>
        <div class="have-account">已有账号？ <el-link><router-link to="login">请登录</router-link></el-link>
        </div>
      </div>
      <el-divider />
      <el-form ref="signupForm" :model="signupForm" :rules="loginRules" class="login-form" auto-complete="on" label-position="left">

        <div class="progress-bar">
          <el-steps :space="200" :active="1" align-center>
            <el-step title="验证手机号" />
            <el-step title="填写账号信息" />
            <el-step title="填写公司信息" />
          </el-steps>
          <br>
          <br>
        </div>

        <el-form-item v-show="checkJson.errorStatus">
          <el-alert
            :title="checkJson.errorMsg"
            type="error"
            show-icon
            close-text="知道了"
            @close="handleClose"
          />
        </el-form-item>
        <el-form-item prop="login_name">
          <span class="mobile-container">
            中国 +86
          </span>
          <el-input
            ref="username"
            v-model="signupForm.username"
            placeholder="请填写常用的手机号码"
            name="username"
            type="text"
            tabindex="1"
            class="input-width"
          />
        </el-form-item>
        <el-button v-popover:popover :loading="loading" type="primary" style="width:100%;margin-bottom:30px;">点击按钮开始验证</el-button>
        <el-popover
          ref="popover"
          v-model="popover"
          placement="top"
          width="430"
          title="请完成拼图验证"
        >
          <Verify
            type="puzzle"
            :show-button="false"
            :img-name="['1.jpg']"
            @success="handlePuzzleSuccess('success')"
            @error="handlePuzzleError('Error')"
          />
        </el-popover>
      </el-form>
    </div>
  </div></template>

<script>
import { validUsername } from '@/utils/validate'
import Verify from '@/components/Verify/Verify'

// import SocialSign from './components/SocialSignin'

export default {
  name: 'Login',
  components: { Verify },
  data() {
    const validateUsername = (rule, value, callback) => {
      if (!validUsername(value)) {
        callback(new Error('请输入正确的用户名'))
      } else {
        callback()
      }
    }
    const validatePassword = (rule, value, callback) => {
      if (value.length < 6) {
        callback(new Error('密码长度不能小于6位'))
      } else {
        callback()
      }
    }
    return {
      signupForm: {
        username: '',
        password: '',
        imageCode: ''
      },
      loginRules: {
        username: [{ required: true, trigger: 'blur', validator: validateUsername }],
        password: [{ required: true, trigger: 'blur', validator: validatePassword }]
      },
      checkJson: {
        // 错误信息
        errorMsg: '',
        // 错误状态
        errorStatus: false
      },
      popover: false,
      codeImg: '',
      passwordType: 'password',
      capsTooltip: false,
      loading: false,
      showDialog: false,
      redirect: undefined,
      otherQuery: {},
      password_reset_href: process.env.VUE_APP_BASE_API + '/password_reset',
      signup_href: process.env.VUE_APP_BASE_API + '/signup'
    }
  },
  watch: {
    $route: {
      handler: function(route) {
        const query = route.query
        if (query) {
          this.redirect = query.redirect
          this.otherQuery = this.getOtherQuery(query)
        }
      },
      immediate: true
    },
    // 输入信息是否有变更监控，如果有变化则情况错误信息
    'signupForm': {
      handler(newVal, oldVal) {
        this.checkJson.errorMsg = ''
      },
      deep: true
    },
    // 错误信息
    'checkJson.errorMsg': {
      handler(newVal, oldVal) {
        if (newVal === undefined) {
          return
        }
        if (newVal.length === 0) {
          // 没有错误
          this.checkJson.errorStatus = false
        } else {
          // 有错误
          this.checkJson.errorStatus = true
        }
      }
    },
    // loading
    'loading': {
      handler(newVal, oldVal) {
        switch (newVal) {
          case true:
            this.showLoading('正在验证登录，请稍后...')
            break
          case false:
            this.closeLoading()
            break
        }
      }
    }
  },
  created() {
    // window.addEventListener('storage', this.afterQRScan)
  },
  mounted() {
    if (this.signupForm.username === '') {
      this.$refs.username.focus()
    } else if (this.signupForm.password === '') {
      this.$refs.password.focus()
    }
  },
  destroyed() {
    // window.removeEventListener('storage', this.afterQRScan)
  },
  methods: {
    checkCapslock({ shiftKey, key } = {}) {
      if (key && key.length === 1) {
        if (shiftKey && (key >= 'a' && key <= 'z') || !shiftKey && (key >= 'A' && key <= 'Z')) {
          this.capsTooltip = true
        } else {
          this.capsTooltip = false
        }
      }
      if (key === 'CapsLock' && this.capsTooltip === true) {
        this.capsTooltip = false
      }
    },
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
      this.$nextTick(() => {
        this.$refs.password.focus()
      })
    },
    getOtherQuery(query) {
      return Object.keys(query).reduce((acc, cur) => {
        if (cur !== 'redirect') {
          acc[cur] = query[cur]
        }
        return acc
      }, {})
    },
    handleClose() {
      this.checkJson.errorStatus = ''
    },
    handleSignUp() {
      alert(111)
    },
    handlePuzzleSuccess(val) {
      this.doPuzzleSuccess()
    },
    handlePuzzleError(val) {
    },
    doPuzzleSuccess() {

    }
  }
}
</script>

<style lang="scss">

$bg:#283443;
$light_gray:#fff;
$cursor: #fff;

@supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
  .login-container .el-input input {
    color: $cursor;
  }
}

.el-step__head.is-finish {
  color: #67c23a;
  border-color: #67c23a;
}
.el-step__description.is-finish {
  color: #67c23a;
  border-color: #67c23a;
}
.el-step__title.is-finish {
  color: #67c23a;
}

.el-step__head.is-process {
  color: #C0C4CC;
  border-color: #C0C4CC;
}

.el-step__title.is-process {
  font-weight: normal;
  color: #C0C4CC;
  border-color: #C0C4CC;
}

.progress-bar {
  position: relative;
  width: 400px;
}

.header {
    height: 110px;
}

.header .logo {
    width: 160px;
    height: 50px;
    float: left;
    margin-top: 24px
}

.header .logo-title {
    float: left;
    height: 34px;
    line-height: 34px;
    font-size: 24px;
    color: #fff;
    margin-top: 34px
}

.header .have-account {
    font-size: 16px;
    float: right;
    margin-top: 44px;
    color: #999
}

.header .have-account a {
    color: #FFFFFF
}

.header .have-account a:hover {
    color: #fff;
    text-decoration: underline
}

.clearfix {
  width: 990px;
  margin: 0 auto;
}

/* reset element-ui css */
.login-container {
  .el-input {
    display: inline-block;
    height: 47px;
    width: 85%;

    input {
      background: transparent;
      border: 0px;
      -webkit-appearance: none;
      border-radius: 0px;
      padding: 12px 5px 12px 15px;
      color: $light_gray;
      height: 47px;
      caret-color: $cursor;

      &:-webkit-autofill {
        box-shadow: 0 0 0px 1000px $bg inset !important;
        -webkit-text-fill-color: $cursor !important;
      }
    }
  }

  .el-form-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    color: #454545;
  }
}
</style>

<style lang="scss" scoped>

.floatRight {
  float: right;
}

$bg:#2d3a4b;
$dark_gray:#889aa4;
$light_gray:#eee;

.login-container {
  min-height: 100%;
  width: 100%;
  background-color: $bg;
  overflow: hidden;

  .login-form {
    position: relative;
    width: 520px;
    max-width: 100%;
    padding: 50px 35px 0;
    margin: 0 auto;
    overflow: hidden;
  }

  .tips {
    font-size: 14px;
    color: #fff;
    margin-bottom: 10px;

    span {
      &:first-of-type {
        margin-right: 16px;
      }
    }
  }

  .mobile-container {
    padding: 0px 0px 0px 20px;
    color: $dark_gray;
    width: 87px;
    display: inline-block;
    border: solid 1px rgba(255,255,255,0.1);
    border-top:none;
    border-bottom:none;
    border-left:none;
  }

  .input-width {
    width: 330px
  }

  .svg-container {
    padding: 6px 5px 6px 15px;
    color: $dark_gray;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
  }

  .title-container {
    position: relative;

    .title {
      font-size: 26px;
      color: $light_gray;
      margin: 0px auto 40px auto;
      text-align: center;
      font-weight: bold;
    }
  }

  .show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: $dark_gray;
    cursor: pointer;
    user-select: none;
  }

  .imageCode {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: $dark_gray;
    cursor: pointer;
    user-select: none;
  }

  .thirdparty-button {
    position: absolute;
    right: 0;
    bottom: 6px;
  }

  @media only screen and (max-width: 470px) {
    .thirdparty-button {
      display: none;
    }
  }
}
</style>
