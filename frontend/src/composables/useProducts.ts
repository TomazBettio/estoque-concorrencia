import { ref } from 'vue'
import { useNotifications } from './useNotifications'

export function useProducts() {
  const products = ref<any[]>([])
  const { notify } = useNotifications()
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/products`)
      const data = await res.json()
      products.value = data
    } catch (error) {
      notify('Erro ao conectar com a API. O backend está rodando?', 'error')
    }
  }

  const buyProduct = async (product: any, quantity: number) => {

    try {
      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          quantity: quantity
        })
      })

      const result = await res.json()

      if (res.ok) {
        const orderId = result.order?.id || result.id; 
        notify(`Sucesso! Pedido #${orderId} criado.`, 'success')
        await fetchProducts()
      } else {
        let errorMsg = 'Erro ao processar pedido.';

        if (result.errors) {
          errorMsg = `Dados inválidos: ${result.errors[0].message}`;
        } else if (result.error) {
          errorMsg = result.error;
        }

        const type = res.status === 409 ? 'warning' : 'error';
        
        if (res.status === 409) {
          errorMsg = 'ERRO DE CONCORRÊNCIA: Alguém comprou antes de você. O estoque foi atualizado.';
        }

        notify(errorMsg, type)
        await fetchProducts()
      }

    } catch (error) {
      notify('Erro de rede ou servidor offline.', 'error')
    }
  }

  return {
    products,
    fetchProducts,
    buyProduct
  }
}
