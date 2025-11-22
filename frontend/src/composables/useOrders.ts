import { ref } from 'vue'
import { genericRequest } from '../utils/genericRequest'
import { useNotifications } from './useNotifications'

const orders = ref<any[]>([])

export function useOrders() {
  const { notify } = useNotifications()

  const fetchOrders = async () => {
    try {
      orders.value = await genericRequest.get('/orders')
    } catch (error) {
      notify('Erro ao buscar ordens.', 'error')
    }
  }

  return {
    orders,
    fetchOrders
  }
}
