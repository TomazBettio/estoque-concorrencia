import { ref } from 'vue'

export interface Notification {
  id: number
  message: string
  type: string
  timeout?: number
}

const notifications = ref<Notification[]>([])
let nextId = 1

export function useNotifications() {
  const remove = (id: number) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index !== -1) {
      notifications.value.splice(index, 1)
    }
  }

  const notify = (message: string, type: string, timeout: number = 3000) => {
    const id = nextId++
    const notification: Notification = { id, message, type, timeout }
    notifications.value.push(notification)

    if (timeout > 0) {
      setTimeout(() => {
        remove(id)
      }, timeout)
    }
  }

  return {
    notifications,
    notify,
    remove
  }
}
