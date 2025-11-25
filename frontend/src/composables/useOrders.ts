import { ref } from 'vue'
import { genericRequest } from '../utils/genericRequest'
import { useNotifications } from './useNotifications'

import type { Order, PaginatedResponse } from '../types'

const orders = ref<Order[]>([])
const currentPage = ref(1)
const totalPages = ref(1)
const limit = ref(10)

export function useOrders() {
  const { notify } = useNotifications()

  const fetchOrders = async (page = currentPage.value) => {
    try {
      const response = await genericRequest.get<PaginatedResponse<Order>>(`/orders?page=${page}&limit=${limit.value}`)
      orders.value = response.data
      currentPage.value = response.meta.page
      totalPages.value = response.meta.totalPages
    } catch (error) {
      notify('Erro ao buscar ordens.', 'error')
    }
  }

  const nextPage = () => {
    if (currentPage.value < totalPages.value) {
      fetchOrders(currentPage.value + 1)
    }
  }

  const prevPage = () => {
    if (currentPage.value > 1) {
      fetchOrders(currentPage.value - 1)
    }
  }

  const createOrder = async (items: { productId: number, quantity: number }[]) => {
    try {
      await genericRequest.post('/orders', { items })
      notify('Pedido realizado com sucesso.', 'success')
      fetchOrders()
    } catch (error: any) {
      notify(error.data?.error || 'Erro ao criar pedido.', 'error')
      throw error
    }
  }

  return {
    orders,
    currentPage,
    totalPages,
    fetchOrders,
    createOrder,
    nextPage,
    prevPage
  }
}
