import request from '@/utils/request'

/**
 * 获取验证码
 * @param {*} data
 */
export function getCaptchaApi() {
  return request({
    url: '/api/v1/captcha/captchaImage',
    method: 'get'
  })
}
