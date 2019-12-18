import request from '@/utils/request'

/**
 * 查询逻辑
 * @param {*} data
 */
export function getTreeListApi(query) {
  return request({
    url: '/api/v1/org/tree/list',
    method: 'post',
    data: query
  })
}

/**
 * 查询逻辑：组织
 * @param {*} data
 */
export function getListApi(query) {
  return request({
    url: '/api/v1/org/list',
    method: 'post',
    data: query
  })
}

/**
 * 查询逻辑：集团
 * @param {*} data
 */
export function getGroupsListApi(query) {
  return request({
    url: '/api/v1/org/groups',
    method: 'post',
    data: query
  })
}

/**
 * 查询逻辑：企业
 * @param {*} data
 */
export function getCompanyListApi(query) {
  return request({
    url: '/api/v1/org/companies',
    method: 'post',
    data: query
  })
}

/**
 * 查询逻辑：部门
 * @param {*} data
 */
export function getDeptListApi(query) {
  return request({
    url: '/api/v1/org/depts',
    method: 'post',
    data: query
  })
}

/**
 * 查询逻辑：岗位
 * @param {*} data
 */
export function getPositionListApi(query) {
  return request({
    url: '/api/v1/org/positions',
    method: 'post',
    data: query
  })
}

/**
 * 查询逻辑：员工
 * @param {*} data
 */
export function getStaffListApi(query) {
  return request({
    url: '/api/v1/org/staffs',
    method: 'post',
    data: query
  })
}

/**
 * 更新api
 * @param {*} data
 */
export function updateApi(data) {
  return request({
    url: '/api/v1/org/save',
    method: 'post',
    data
  })
}

/**
 * 插入api
 * @param {*} data
 */
export function insertApi(data) {
  return request({
    url: '/api/v1/org/insert',
    method: 'post',
    data
  })
}

/**
 * 新增模式下，可新增子节点得类型
 * @param {*} data
 */
export function getCorrectTypeByInsertStatusApi(data) {
  return request({
    url: '/api/v1/org/get_type',
    method: 'post',
    data
  })
}

/**
 * 删除子节点
 * @param {*} data
 */
export function deleteApi(data) {
  return request({
    url: '/api/v1/org/delete',
    method: 'post',
    data
  })
}
