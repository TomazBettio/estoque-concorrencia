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
  bottom: 2rem;
  right: 2rem;
  width: 320px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  box-shadow: var(--shadow-md);
  padding: 1.25rem;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 4rem);
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-color);
}

.cart-header h2 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-main);
}

.clear-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 0.85rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}
.clear-btn:hover { background-color: #f1f5f9; color: var(--danger); }

.cart-items {
  list-style: none;
  padding: 0;
  margin: 0;
  overflow-y: auto;
  flex: 1;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f1f5f9;
}
.cart-item:last-child { border-bottom: none; }

.item-info {
  display: flex;
  flex-direction: column;
}

.item-name {
  font-weight: 500;
  font-size: 0.9rem;
  color: var(--text-main);
}

.item-qty {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.remove-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
}
.remove-btn:hover { background-color: #fef2f2; color: var(--danger); }

.cart-actions {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.finalize-btn {
  width: 100%;
  padding: 0.75rem;
  background-color: var(--primary);
  color: white;
  border: none;
  border-radius: var(--radius);
  font-weight: 600;
  cursor: pointer;
}
.finalize-btn:hover:not(:disabled) { background-color: var(--primary-hover); }
.finalize-btn:disabled { opacity: 0.7; cursor: not-allowed; }

.error-msg {
  margin-top: 0.5rem;
  color: var(--danger);
  font-size: 0.85rem;
  text-align: center;
}
</style>
