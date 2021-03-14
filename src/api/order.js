import request from '@/utils/request'
import Qs from 'qs'

export function listOrder(query) {
  return request({
    url: '/order/listByUser',
    method: 'get',
    params: query,
  })
}

export function deletedOrder(data) {
  return request({
    url: '/order/delete',
    method: 'post',
    data
  })
}

export function shipOrder(data) {
  return request({
    url: '/order/ship',
    method: 'post',
    data
  })
}

export function refundOrder(data) {
  return request({
    url: '/order/refund',
    method: 'post',
    data
  })
}

export function replyComment(data) {
  return request({
    url: '/order/reply',
    method: 'post',
    data
  })
}

export function listShipChannel() {
  return request({
    url: '/order/listShipChannel',
    method: 'get'
  })
}
