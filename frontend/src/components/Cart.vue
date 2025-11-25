<template>
  <div class="cart-container" v-if="items.length > 0">
    <div class="cart-header">
      <h2>Pedido ({{ totalItems }})</h2>
      <button @click="clearCart" class="clear-btn">Limpar</button>
    </div>
    
    <ul class="cart-items">
      <li v-for="item in items" :key="item.productId" class="cart-item">
        <div class="item-info">
          <span class="item-name">{{ item.name }}</span>
          <span class="item-qty">x{{ item.quantity }}</span>
        </div>
        <button @click="removeFromCart(item.productId)" class="remove-btn" title="Remover item">
          <Trash2 :size="18" />
        </button>
      </li>
    </ul>

    <div class="cart-actions">
      <button 
        @click="finalizeOrder" 
        class="finalize-btn"
        :disabled="isSubmitting"
      >
        {{ isSubmitting ? 'Processando...' : 'Finalizar Pedido' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Trash2 } from 'lucide-vue-next'
import { useCart } from '../composables/useCart'
import { useOrders } from '../composables/useOrders'
import { useProducts } from '../composables/useProducts'

const { items, totalItems, removeFromCart, clearCart } = useCart()
const { createOrder } = useOrders()
const { fetchProducts } = useProducts()

const isSubmitting = ref(false)
const errorMessage = ref('')

const finalizeOrder = async () => {
  if (items.value.length === 0) return

  isSubmitting.value = true
  errorMessage.value = ''

  try {
    // Map cart items to API format
    const orderItems = items.value.map(item => ({
      productId: item.productId,
      quantity: item.quantity
    }))

    await createOrder(orderItems)
    await fetchProducts()
    
    clearCart()
  } catch (error: any) {
    console.error('Failed to finalize order:', error)
    errorMessage.value = error.message || 'Erro ao finalizar pedido'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.cart-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 300px;
  background: white;
  border: 1px solid #e1e4e8;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  padding: 15px;
  z-index: 1000;
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
}

.cart-header h2 { margin: 0; font-size: 1.1rem; }

.clear-btn {
  background: none;
  border: none;
  color: #666;
  font-size: 0.8rem;
  cursor: pointer;
  text-decoration: underline;
}

.cart-items {
  list-style: none;
  padding: 0;
  margin: 0 0 15px 0;
  max-height: 200px;
  overflow-y: auto;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f5f5f5;
}

.item-info { display: flex; flex-direction: column; }
.item-name { font-weight: 500; font-size: 0.9rem; }
.item-qty { font-size: 0.8rem; color: #666; }

.remove-btn {
  background: none;
  border: none;
  color: #ff4d4f;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.2s;
}
.remove-btn:hover {
  background-color: #fff5f5;
}

.finalize-btn {
  width: 100%;
  padding: 10px;
  background-color: #10b981;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.finalize-btn:hover:not(:disabled) { background-color: #059669; }
.finalize-btn:disabled { background-color: #a7f3d0; cursor: not-allowed; }

.error-msg {
  margin-top: 10px;
  color: #dc2626;
  font-size: 0.85rem;
  text-align: center;
}
</style>
