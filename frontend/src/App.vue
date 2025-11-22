<template>
  <div class="container">
    <header>
      <h1>🛒 Sistema de Compras (Teste Concorrência)</h1>
      <p class="subtitle">Front-end Vue.js + API Node/Postgres</p>
    </header>

    <NotificationBanner />

    <div class="grid">
      <ProductCard 
        v-for="product in products" 
        :key="product.id" 
        :product="product"
        @buy="handleBuy"
      />
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import NotificationBanner from './components/NotificationBanner.vue'
import ProductCard from './components/ProductCard.vue'
import { useProducts } from './composables/useProducts'

const { products, fetchProducts, buyProduct } = useProducts()

const handleBuy = ({ product, quantity }) => {
  buyProduct(product, quantity)
}

onMounted(() => {
  fetchProducts()
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

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}
</style>