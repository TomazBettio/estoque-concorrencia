export interface Product {
  id: number
  name: string
  stock: number
  description?: string
  version?: number
}

export interface OrderItem {
  id: number
  productId: number
  product_name?: string
  quantity: number
  price?: number
}

export interface Order {
  id: number
  status: string
  total: number
  created_at: string
  items: OrderItem[]
}

export interface CartItem {
  productId: number
  name: string
  quantity: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}
