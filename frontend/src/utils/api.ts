const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface RequestOptions extends RequestInit {
  body?: any;
}

async function request<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, ...otherOptions } = options;

  const config: RequestInit = {
    ...otherOptions,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_URL}${url}`, config);
  const data = await response.json();

  if (!response.ok) {

    throw {
      status: response.status,
      message: data.error || (data.errors ? data.errors[0].message : 'Erro desconhecido'),
      data: data
    };
  }

  return data;
}

export const api = {
  get: <T>(url: string, options?: RequestOptions) => request<T>(url, { ...options, method: 'GET' }),
  post: <T>(url: string, body: any, options?: RequestOptions) => request<T>(url, { ...options, method: 'POST', body }),
  put: <T>(url: string, body: any, options?: RequestOptions) => request<T>(url, { ...options, method: 'PUT', body }),
  del: <T>(url: string, options?: RequestOptions) => request<T>(url, { ...options, method: 'DELETE' }),
};
