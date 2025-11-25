<template>
  <div class="orders-container">
    <h2>Histórico de pedidos</h2>
    <div v-if="orders.length === 0" class="no-orders">
      Nenhum pedido realizado ainda.
    </div>
    <div class="orders-list">
      <div v-for="order in orders" :key="order.id" class="order-card">
        <div class="order-header">
          <span class="order-id">Pedido #{{ order.id }}</span>
          <span class="order-date">{{ new Date(order.created_at).toLocaleString() }}</span>
          <span class="status-badge" :class="order.status">{{ order.status }}</span>
        </div>
        
        <div class="order-items">
          <div v-for="item in order.items" :key="item.id" class="order-item">
            <span class="item-name">{{ item.product_name }}</span>
            <span class="item-qty">x{{ item.quantity }}</span>
          </div>
        </div>
        
        <div class="order-total" v-if="order.total > 0">
          Total: R$ {{ order.total }}
        </div>
      </div>
    </div>

    <div v-if="totalPages > 1" class="pagination">
      <button 
        :disabled="currentPage === 1" 
        @click="prevPage"
        class="page-btn"
      >
        Anterior
      </button>
      
      <span class="page-info">
        Página {{ currentPage }} de {{ totalPages }}
      </span>

      <button 
        :disabled="currentPage === totalPages" 
        @click="nextPage"
        class="page-btn"
      >
        Próxima
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useOrders } from '../composables/useOrders'

const { orders, fetchOrders, currentPage, totalPages, nextPage, prevPage } = useOrders()

onMounted(() => {
  fetchOrders()
})
</script>

<style scoped>
.orders-container {
  margin-top: 40px;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

h2 {
  margin-bottom: 20px;
  color: #2c3e50;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.order-card {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 15px;
  background: #fff;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f5f5f5;
}

.order-id { font-weight: bold; color: #2c3e50; }
.order-date { color: #666; font-size: 0.9rem; }

.order-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.order-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.95rem;
}

.item-name { color: #333; }
.item-qty { color: #666; font-weight: 500; }

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  text-transform: uppercase;
  font-weight: 600;
}

.status-badge.completed {
  background-color: #d1fae5;
  color: #065f46;
}

.no-orders {
  text-align: center;
  padding: 20px;
  color: #666;
  font-style: italic;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
}

.page-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f5f5f5;
}

.page-btn:not(:disabled):hover {
  background: #f0f0f0;
  border-color: #ccc;
}

.page-info {
  font-size: 0.9rem;
  color: #666;
}
</style>
