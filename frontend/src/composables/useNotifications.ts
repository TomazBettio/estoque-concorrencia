import { ref } from 'vue'

const notification = ref({ message: '', type: '' })

export function useNotifications() {
  const notify = (message: string, type: string) => {
    notification.value = { message, type }
  }

  const clear = () => {
    notification.value = { message: '', type: '' }
  }

  return {
    notification,
    notify,
    clear
  }
}
