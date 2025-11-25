<template>
  <div class="orders-container">
    <h2>Histórico de pedidos</h2>
    <div v-if="orders.length === 0" class="no-orders">
      Nenhum pedido realizado ainda.
    </div>
    <table v-else class="orders-table">
      <thead>
        <tr>
          <th>ID da Ordem</th>
          <th>Produto ID</th>
          <th>Nome</th>
          <th>Quantidade</th>
          <th>Data</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="order in orders" :key="order.id">
          <td>{{ order.id }}</td>
          <td>{{ order.product_id }}</td>
          <td>{{ order.product_name }}</td>
          <td>{{ order.quantity }}</td>
          <td>{{ new Date(order.created_at).toLocaleString() }}</td>
        </tr>
      </tbody>
    </table>

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

.orders-table {
  width: 100%;
  border-collapse: collapse;
}

.orders-table th,
.orders-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.orders-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #666;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 500;
}

.status-badge.completed {
  background-color: #d4edda;
  color: #155724;
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
