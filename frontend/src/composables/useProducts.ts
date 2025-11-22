import { ref } from 'vue'
import { useNotifications } from './useNotifications'
import { api } from '../utils/api'

export function useProducts() {
  const products = ref<any[]>([])
  const { notify } = useNotifications()

  const fetchProducts = async () => {
    try {
      products.value = await api.get('/products')
    } catch (error) {
      notify('Erro ao conectar com a API. Verifique a conexão com o backend.', 'error')
    }
  }

  const fetchProduct = async (id: number) => {
    try {
      const updatedProduct = await api.get(`/products/${id}`)
      
      const index = products.value.findIndex(p => p.id === id)
      if (index !== -1) {
        products.value[index] = updatedProduct
      }
    } catch (error) {
      console.error('Falha ao atualizar o produto', error)
    }
  }

  const buyProduct = async (product: any, quantity: number) => {
    try {
      const result: any = await api.post('/orders', {
        productId: product.id,
        quantity: quantity
      })

      const orderId = result.order?.id || result.id; 
      notify(`Sucesso! Pedido #${orderId} criado.`, 'success')
      await fetchProduct(product.id)

    } catch (error: any) {
      if (error.status) {
        let errorMsg = error.message || 'Erro ao processar pedido.';
        const type = error.status === 409 ? 'warning' : 'error';
        
        if (error.status === 409) {
          errorMsg = 'ERRO DE CONCORRÊNCIA: Alguém comprou antes de você. O estoque foi atualizado.';
        }

        notify(errorMsg, type)
        await fetchProduct(product.id)
      } else {
        notify('Erro de rede ou servidor offline.', 'error')
      }
    }
  }

  return {
    products,
    fetchProducts,
    buyProduct
  }
}
