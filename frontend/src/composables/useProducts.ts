import { ref } from 'vue'
import { useNotifications } from './useNotifications'
import { genericRequest } from '../utils/genericRequest'

import type { Product } from '../types'

const products = ref<Product[]>([])

export function useProducts() {
  const { notify } = useNotifications()

  const fetchProducts = async () => {
    try {
      products.value = await genericRequest.get('/products')
    } catch (error) {
      notify('Erro ao conectar com a API. Verifique a conexão com o backend.', 'error')
    }
  }

  const fetchProduct = async (id: number) => {
    try {
      const updatedProduct = await genericRequest.get<Product>(`/products/${id}`)
      
      const index = products.value.findIndex(p => p.id === id)
      if (index !== -1) {
        products.value[index] = updatedProduct
      }
    } catch (error) {
      notify('Falha ao atualizar o produto', 'error')
    }
  }

  const buyProduct = async (product: Product, quantity: number): Promise<boolean> => {
    try {
      const result: any = await genericRequest.post('/orders', {
        items: [{
          productId: product.id,
          quantity: quantity
        }]
      })

      const orderId = result.order?.id || result.id; 
      notify(`Sucesso! Pedido #${orderId} criado.`, 'success')
      await fetchProduct(product.id)
      return true

    } catch (error: any) {
      if (error.status) {
        let errorMsg = error.message || 'Erro ao processar pedido.';
        const type = error.status === 409 ? 'warning' : 'error';
        
        if (error.status === 409) {
          errorMsg = 'Alguém comprou antes de você. O estoque foi atualizado. (Concorrência)';
        }

        notify(errorMsg, type)
        await fetchProduct(product.id)
      } else {
        notify('Erro de rede ou servidor offline.', 'error')
      }
      return false
    }
  }

  return {
    products,
    fetchProducts,
    buyProduct
  }
}
