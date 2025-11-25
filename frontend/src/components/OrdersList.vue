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
            <span class="item-qty">{{ item.quantity }}</span>
          </div>
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
.orders-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--text-muted);
  background: var(--bg-card);
  border-radius: var(--radius);
  border: 1px dashed var(--border-color);
}

.order-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  padding: 1rem;
  box-shadow: var(--shadow-sm);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-color);
}

.order-id {
  font-weight: 600;
  color: var(--text-main);
}

.order-date {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-completed { background-color: #dcfce7; color: #166534; }
.status-pending { background-color: #fef9c3; color: #854d0e; }
.status-cancelled { background-color: #fee2e2; color: #991b1b; }

.order-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.order-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
}

.item-name { color: var(--text-main); }
.item-qty { color: var(--text-muted); }

.order-total {
  margin-top: 1rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--border-color);
  text-align: right;
  font-weight: 600;
  color: var(--text-main);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

.page-btn {
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  cursor: pointer;
}
.page-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.page-btn:hover:not(:disabled) { background-color: #f1f5f9; }

.page-info {
  font-size: 0.9rem;
  color: var(--text-muted);
}
</style>
