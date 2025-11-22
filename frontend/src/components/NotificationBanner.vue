<template>
  <transition name="slide-fade">
    <div v-if="notification.message" :class="['notification', notification.type]">
      <div class="content">
        {{ notification.message }}
      </div>
      <button class="close-btn" @click="clear">&times;</button>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { watch, onUnmounted } from 'vue'
import { useNotifications } from '../composables/useNotifications'

const { notification, clear } = useNotifications()

let timer: ReturnType<typeof setTimeout> | null = null

watch(() => notification.value.message, (newMsg) => {
  if (timer) clearTimeout(timer)
  
  if (newMsg) {
    const duration = notification.value.type === 'success' ? 3000 : 5000
    timer = setTimeout(() => {
      clear()
    }, duration)
  }
})

onUnmounted(() => {
  if (timer) clearTimeout(timer)
})
</script>

<style scoped>
.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  min-width: 300px;
  max-width: 400px;
  padding: 15px 20px;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  font-weight: 500;
}

.content {
  margin-right: 10px;
}

.close-btn {
  background: none;
  border: none;
  color: inherit;
  font-size: 1.2rem;
  line-height: 1;
  cursor: pointer;
  opacity: 0.6;
  padding: 0;
}
.close-btn:hover { opacity: 1; }

.notification.success { background-color: #d4edda; color: #155724; border-left: 5px solid #28a745; }
.notification.error   { background-color: #f8d7da; color: #721c24; border-left: 5px solid #dc3545; }
.notification.warning { background-color: #fff3cd; color: #856404; border-left: 5px solid #ffc107; }

.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}
.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}
</style>
