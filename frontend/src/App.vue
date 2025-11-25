<template>
  <div class="app-wrapper">
    <header class="main-header">
      <div class="header-content container">
        <div class="brand">
          <h1>Controle de Estoque</h1>
        </div>
        
        <nav class="main-nav">
          <button 
            :class="['nav-btn', { active: currentView === 'products' }]" 
            @click="currentView = 'products'"
          >
            Produtos
          </button>
          <button 
            :class="['nav-btn', { active: currentView === 'orders' }]" 
            @click="currentView = 'orders'"
          >
            Pedidos
          </button>
        </nav>
      </div>
    </header>

    <main class="container main-content">
      <NotificationBanner />

      <div v-if="currentView === 'products'" class="products-list">
        <ProductCard 
          v-for="product in products" 
          :key="product.id" 
          :product="product"
        />
      </div>

      <OrdersList v-else />
    </main>
    
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
.app-wrapper {
  min-height: 100vh;
  background-color: var(--bg-body);
}

.main-header {
  background-color: var(--bg-card);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: var(--shadow-sm);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  padding-bottom: 1rem;
}

.brand h1 {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-main);
  letter-spacing: -0.025em;
}

.main-nav {
  display: flex;
  gap: 0.5rem;
  background-color: #f1f5f9;
  padding: 4px;
  border-radius: 8px;
}

.nav-btn {
  padding: 6px 16px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  font-weight: 500;
  font-size: 0.9rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-btn:hover {
  color: var(--text-main);
}

.nav-btn.active {
  background-color: white;
  color: var(--primary);
  box-shadow: var(--shadow-sm);
}

.products-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
}

@media (max-width: 640px) {
  .header-content {
    flex-direction: column;
    gap: 1rem;
  }
  
  .main-nav {
    width: 100%;
    justify-content: center;
  }
  
  .nav-btn {
    flex: 1;
  }
}
</style>