<template>
  <div class="container">
    <header>
      <h1>🛒 Sistema de Compras (Teste Concorrência)</h1>
      <p class="subtitle">Front-end Vue.js + API Node/SQLite</p>
    </header>

    <NotificationBanner 
      :message="notification.message" 
      :type="notification.type" 
    />

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
import { ref, onMounted } from 'vue'
import NotificationBanner from './components/NotificationBanner.vue'
import ProductCard from './components/ProductCard.vue'

const products = ref([])
const notification = ref({ message: '', type: '' })

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const fetchProducts = async () => {
  try {
    const res = await fetch(`${API_URL}/products`)
    const data = await res.json()
    products.value = data
  } catch (error) {
    showNotification('Erro ao conectar com a API. O backend está rodando?', 'error')
  }
}

// Função para comprar um produto
const handleBuy = async ({ product, quantity }) => {
  notification.value = { message: '', type: '' }

  try {
    const res = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: product.id,
        quantity: quantity
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

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}
</style>