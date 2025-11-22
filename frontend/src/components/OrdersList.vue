<template>
  <div class="orders-container">
    <h2>Histórico de Pedidos</h2>
    <div v-if="orders.length === 0" class="no-orders">
      Nenhum pedido realizado ainda.
    </div>
    <table v-else class="orders-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Produto ID</th>
          <th>Quantidade</th>
          <th>Status</th>
          <th>Data</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="order in orders" :key="order.id">
          <td>#{{ order.id }}</td>
          <td>{{ order.product_id }}</td>
          <td>{{ order.quantity }}</td>
          <td>
            <span :class="['status-badge', order.status || 'completed']">
              {{ order.status || 'Concluído' }}
            </span>
          </td>
          <td>{{ new Date(order.created_at).toLocaleString() }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useOrders } from '../composables/useOrders'

const { orders, fetchOrders } = useOrders()

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
</style>
