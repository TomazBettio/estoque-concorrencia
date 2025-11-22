<template>
  <div v-if="message" :class="['notification', type]">
    {{ message }}
  </div>
</template>

<script setup lang="ts">
defineProps<{
  message: string
  type: string
}>()
</script>

<style scoped>
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

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
