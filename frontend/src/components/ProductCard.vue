<template>
  <div class="card" :class="{ 'disabled': product.stock === 0 }">
    <div class="card-header">
      <div class="header-content">
        <h3>{{ product.name }}</h3>
        <button 
          class="toggle-btn" 
          @click="showDescription = !showDescription"
          :aria-expanded="showDescription"
          v-if="product.description"
        >
          <component :is="showDescription ? ChevronUp : ChevronDown" :size="20" />
        </button>
      </div>
      <span v-if="product.stock > 0" class="badge in-stock">
        Disponível: {{ product.stock }}
      </span>
      <span v-else class="badge out-stock">
        Esgotado
      </span>
    </div>

    <div v-if="showDescription && product.description" class="product-description">
      <p>{{ product.description }}</p>
    </div>

    <div class="card-body">
      <label>Quantidade:</label>
      <div class="input-group">
        <input 
          type="number" 
          v-model="buyQty" 
          min="1" 
          :max="product.stock"
          :disabled="product.stock === 0"
        >
        <button 
          class="buy-btn"
          @click="handleBuy" 
          :disabled="product.stock === 0 || buyQty < 1"
        >
          {{ product.stock === 0 ? 'Esgotado' : 'Adicionar ao Pedido' }}
        </button>
        <button 
          class="direct-buy-btn"
          @click="handleDirectBuy" 
          :disabled="product.stock === 0 || buyQty < 1"
          v-if="product.stock > 0"
        >
          Comprar Agora
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ChevronDown, ChevronUp } from 'lucide-vue-next'
import { useCart } from '../composables/useCart'
import { useOrders } from '../composables/useOrders'
import { useProducts } from '../composables/useProducts'

const props = defineProps<{
  product: {
    id: number
    name: string
    stock: number
    description?: string
  }
}>()

const emit = defineEmits<{
  (e: 'buy', payload: { product: typeof props.product, quantity: number }): void
}>()

const { addToCart } = useCart()
const { createOrder } = useOrders()
const { fetchProducts } = useProducts()

const buyQty = ref(1)
const showDescription = ref(false)

// Reset quantity when stock changes to 0 or component re-mounts if needed, 
// but mainly we just want to ensure it's valid. 
// Actually, keeping it as 1 is fine.

const handleBuy = () => {
  addToCart(props.product, buyQty.value)
  buyQty.value = 1 // Reset quantity
  // Optional: Show toast notification
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
  border: 1px solid #e1e4e8;
  border-radius: 12px;
  padding: 20px;
  background: white;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  transition: transform 0.2s;
}
.card:hover { transform: translateY(-2px); box-shadow: 0 6px 12px rgba(0,0,0,0.1); }
.card.disabled { opacity: 0.7; background-color: #f9f9f9; }

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}
.header-content {
  display: flex;
  align-items: center;
  gap: 8px;
}
.card-header h3 { margin: 0; font-size: 1.1rem; }

.toggle-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  font-size: 0.8rem;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
  flex: 0 0 auto; /* Prevent shrinking */
  width: auto; /* Override default button width */
}
.toggle-btn:hover { background: none; color: #333; }

.product-description {
  margin-bottom: 15px;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 6px;
  font-size: 0.9rem;
  color: #555;
}

.badge { padding: 4px 10px; border-radius: 20px; font-size: 0.85rem; font-weight: bold; }
.in-stock { background-color: #e6fffa; color: #2c7a7b; }
.out-stock { background-color: #fff5f5; color: #c53030; }

.input-group { display: flex; gap: 10px; }

input {
  width: 60px;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 6px;
  text-align: center;
}

.buy-btn {
  flex: 1;
  padding: 8px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 400;
  transition: background 0.2s;
}
.buy-btn:hover:not(:disabled) { background-color: #2563eb; }
.buy-btn:disabled { background-color: #bdc3c7; cursor: not-allowed; }

.direct-buy-btn {
  flex: 1;
  padding: 8px;
  background-color: #10b981; /* Emerald 500 */
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 400;
  transition: background 0.2s;
}
.direct-buy-btn:hover:not(:disabled) { background-color: #059669; }
</style>
