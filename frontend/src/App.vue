<template>
  <div class="container">
    <header>
      <h1>🛒 Sistema de Compras (Teste Concorrência)</h1>
      <p class="subtitle">Front-end Vue.js + API Node/SQLite</p>
    </header>

    <div v-if="notification.message" :class="['notification', notification.type]">
      {{ notification.message }}
    </div>

    <div class="grid">
      <div v-for="product in products" :key="product.id" class="card" :class="{ 'disabled': product.stock === 0 }">
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
              v-model="product.buyQty" 
              min="1" 
              :max="product.stock"
              :disabled="product.stock === 0"
            >
            <button 
              @click="buyProduct(product)" 
              :disabled="product.stock === 0 || product.buyQty < 1"
            >
              {{ product.stock === 0 ? 'Esgotado' : 'Comprar' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'

const products = ref([])
const notification = ref({ message: '', type: '' })

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const fetchProducts = async () => {
  try {
    const res = await fetch(`${API_URL}/products`)
    const data = await res.json()
    
    // Mapeia os produtos para adicionar um campo local de "quantidade a comprar"
    products.value = data.map(p => ({
      ...p,
      buyQty: 1 // Padrão inicial
    }))
  } catch (error) {
    showNotification('Erro ao conectar com a API. O backend está rodando?', 'error')
  }
}

// Função para comprar um produto
const buyProduct = async (product) => {
  notification.value = { message: '', type: '' }

  try {
    const res = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: product.id,
        quantity: product.buyQty
      })
    })

    const result = await res.json()

    if (res.ok) {
      // O backend agora retorna { order: { id: ... } }
      const orderId = result.order?.id || result.id; 
      
      showNotification(`Sucesso! Pedido #${orderId} criado.`, 'success')
      await fetchProducts()
    } else {
      // TRATAMENTO DE ERROS (Zod + Regra de Negócio)
      
      let errorMsg = 'Erro ao processar pedido.';

      // Se for erro do Zod (Validação de dados)
      if (result.errors) {
        // Pega a primeira mensagem de erro do Zod
        errorMsg = `Dados inválidos: ${result.errors[0].message}`;
      } 
      // Se for erro de negócio (Estoque, Concorrência)
      else if (result.error) {
        errorMsg = result.error;
      }

      // Define o tipo de alerta visual
      const type = res.status === 409 ? 'warning' : 'error';
      
      // Se for conflito (409), personaliza a mensagem
      if (res.status === 409) {
        errorMsg = 'ERRO DE CONCORRÊNCIA: Alguém comprou antes de você. O estoque foi atualizado.';
      }

      showNotification(errorMsg, type)
      
      // Atualiza a lista para ver o estoque real
      await fetchProducts()
    }

  } catch (error) {
    showNotification('Erro de rede ou servidor offline.', 'error')
  }
}

const showNotification = (msg, type) => {
  notification.value = { message: msg, type: type }
  // Limpa msg de sucesso após 3 segundos, mas mantém as de erro
  if (type === 'success') {
    setTimeout(() => notification.value = { message: '', type: '' }, 3000)
  }
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

.notification {
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-weight: bold;
  text-align: center;
  animation: fadeIn 0.3s ease;
}
.notification.success { background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
.notification.error   { background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
.notification.warning { background-color: #fff3cd; color: #856404; border: 1px solid #ffeeba; }

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

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

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>