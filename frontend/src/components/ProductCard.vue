<template>
  <div class="card" :class="{ 'disabled': product.stock === 0 }">
    <div class="card-header">
      <h3>{{ product.name }}</h3>
      <span class="badge" :class="product.stock > 0 ? 'in-stock' : 'out-stock'">
        Estoque: {{ product.stock }}
      </span>
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
          @click="handleBuy" 
          :disabled="product.stock === 0 || buyQty < 1"
        >
          {{ product.stock === 0 ? 'Esgotado' : 'Comprar' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  product: {
    id: number
    name: string
    stock: number
  }
}>()

const emit = defineEmits<{
  (e: 'buy', payload: { product: typeof props.product, quantity: number }): void
}>()

const buyQty = ref(1)

// Reset quantity when stock changes to 0 or component re-mounts if needed, 
// but mainly we just want to ensure it's valid. 
// Actually, keeping it as 1 is fine.

const handleBuy = () => {
  emit('buy', { product: props.product, quantity: buyQty.value })
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
  align-items: center;
  margin-bottom: 15px;
}
.card-header h3 { margin: 0; font-size: 1.1rem; }

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

button {
  flex: 1;
  padding: 10px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s;
}
button:hover:not(:disabled) { background-color: #2563eb; }
button:disabled { background-color: #bdc3c7; cursor: not-allowed; }
</style>
