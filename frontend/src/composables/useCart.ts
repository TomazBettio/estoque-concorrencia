import { ref, computed } from 'vue'

export interface CartItem {
  productId: number
  name: string
  quantity: number
}

const items = ref<CartItem[]>([])

export function useCart() {
  
  const addToCart = (product: { id: number, name: string }, quantity: number) => {
    const existingItem = items.value.find(item => item.productId === product.id)
    
    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      items.value.push({
        productId: product.id,
        name: product.name,
        quantity
      })
    }
  }

  const removeFromCart = (productId: number) => {
    const index = items.value.findIndex(item => item.productId === productId)
    if (index > -1) {
      items.value.splice(index, 1)
    }
  }

  const clearCart = () => {
    items.value = []
  }

  const totalItems = computed(() => {
    return items.value.reduce((acc, item) => acc + item.quantity, 0)
  })

  return {
    items,
    addToCart,
    removeFromCart,
    clearCart,
    totalItems
  }
}
