import request from '@/utils/request'

export function listByUserId(data) {
  return request({
    url: '/collection/listByUserId',
    method: 'get',
    params:data
  })
}
