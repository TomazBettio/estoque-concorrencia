<template>
  <div class="card" :class="{ 'disabled': product.stock === 0 }">
    <div class="card-content">
      <div class="header-row">
        <h3>{{ product.name }}</h3>
        <span v-if="product.stock > 0" class="badge in-stock">
          Disponível: {{ product.stock }}
        </span>
        <span v-else class="badge out-stock">Esgotado</span>
      </div>

      <div class="description">
        {{ product.description }}
      </div>
    </div>

    <div class="card-actions">
      <div v-if="product.stock > 0" class="qty-row">
        <label>Quantidade:</label>
        <input 
          type="number" 
          v-model="buyQty" 
          min="1" 
          :max="product.stock"
          :disabled="product.stock === 0"
          class="qty-input"
        >
      </div>
      
      <div class="btn-group">
        <button
          v-if="product.stock > 0"
          class="btn btn-primary"
          @click="handleBuy" 
          :disabled="product.stock === 0 || buyQty < 1"
        >
          Adicionar ao pedido
        </button>
        <button 
          v-if="product.stock > 0"
          class="btn btn-success"
          @click="handleDirectBuy" 
          :disabled="buyQty < 1"
        >
          Comprar agora
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useCart } from '../composables/useCart'
import { useOrders } from '../composables/useOrders'
import { useProducts } from '../composables/useProducts'

import type { Product } from '../types'

const props = defineProps<{
  product: Product
}>()

const emit = defineEmits<{
  (e: 'buy', payload: { product: typeof props.product, quantity: number }): void
}>()

const { addToCart } = useCart()
const { createOrder } = useOrders()
const { fetchProducts } = useProducts()

const buyQty = ref(1)

const handleBuy = () => {
  addToCart(props.product, buyQty.value)
  buyQty.value = 1 // Reset quantity
}

const handleDirectBuy = async () => {
  try {
    await createOrder([{
      productId: props.product.id,
      quantity: buyQty.value
    }])
    await fetchProducts()
    buyQty.value = 1
  } catch (error) {
    console.error('Direct buy failed', error)
  }
}
</script>

<style scoped>
.card {
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  padding: 1rem;
  background: var(--bg-card);
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.card.disabled {
  opacity: 0.7;
  background-color: #f8fafc;
}

/* Desktop: Horizontal Layout */
@media (min-width: 640px) {
  .card {
    flex-direction: row;
    align-items: flex-start;
  }
}

.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.header-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.header-row h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-main);
}

.toggle-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  color: var(--text-muted);
  display: flex;
  align-items: center;
}

.badge {
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.in-stock { background-color: #dcfce7; color: #166534; }
.out-stock { background-color: #fee2e2; color: #991b1b; }

.description {
  font-size: 0.9rem;
  color: var(--text-muted);
  background: #f8fafc;
  padding: 0.5rem;
  border-radius: 4px;
}

.card-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 200px;
}

.qty-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: flex-end;
}

.qty-input {
  width: 3.5rem;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  text-align: center;
}

.btn-group {
  display: flex;
  gap: 0.5rem;
}

.btn {
  flex: 1;
  padding: 0.5rem;
  border-radius: var(--radius);
  cursor: pointer;
  font-weight: 500;
  border: 1px solid transparent;
  white-space: nowrap;
}

.btn-primary {
  background-color: white;
  color: var(--primary);
  border-color: var(--primary);
}
.btn-primary:hover:not(:disabled) { background-color: #eff6ff; }

.btn-success {
  background-color: var(--success);
  color: white;
}
.btn-success:hover:not(:disabled) { background-color: var(--success-hover); }

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: #f1f5f9;
  border-color: var(--border-color);
  color: var(--text-muted);
}

@media (max-width: 640px) {
  .card-actions {
    width: 100%;
    min-width: auto;
  }
  
  .qty-row {
    justify-content: space-between;
  }
}
</style>
