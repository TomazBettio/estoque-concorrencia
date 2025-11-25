<template>
  <div class="container">
    <header>
      <h1>🛒 Sistema de Compras (Teste Concorrência)</h1>
      <p class="subtitle">Front-end Vue.js + API Node/Postgres</p>
      
      <div class="view-toggle">
        <button 
          :class="{ active: currentView === 'products' }" 
          @click="currentView = 'products'"
        >
          Produtos
        </button>
        <button 
          :class="{ active: currentView === 'orders' }" 
          @click="currentView = 'orders'"
        >
          Pedidos
        </button>
      </div>
    </header>

    <NotificationBanner />

    <div v-if="currentView === 'products'" class="grid">
      <ProductCard 
        v-for="product in products" 
        :key="product.id" 
        :product="product"
      />
    </div>

    <OrdersList v-else />
    
    <Cart />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import NotificationBanner from './components/NotificationBanner.vue'
import ProductCard from './components/ProductCard.vue'
import OrdersList from './components/OrdersList.vue'
import Cart from './components/Cart.vue'
import { useProducts } from './composables/useProducts'
import { useOrders } from './composables/useOrders'

const { products, fetchProducts } = useProducts()
const { fetchOrders } = useOrders()

const currentView = ref('products')

onMounted(() => {
  fetchProducts()
  fetchOrders()
})
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
}

header { text-align: center; margin-bottom: 40px; }
h1 { margin: 0; color: #2c3e50; }
.subtitle { color: #7f8c8d; margin-top: 5px; }

.view-toggle {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 7px;
}

.view-toggle button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: #fff;
  cursor: pointer;
  border-radius: 4px;
  font-weight: 500;
  transition: all 0.2s;
}

.view-toggle button.active {
  background: #2c3e50;
  color: #fff;
  border-color: #2c3e50;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}
</style>