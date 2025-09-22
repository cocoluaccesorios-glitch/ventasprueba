import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import { vi } from 'vitest'

// Crear router de prueba
export function createTestRouter() {
  return createRouter({
    history: createWebHistory(),
    routes: [
      { path: '/', component: { template: '<div>Home</div>' } },
      { path: '/login', component: { template: '<div>Login</div>' } },
      { path: '/dashboard', component: { template: '<div>Dashboard</div>' } }
    ]
  })
}

// Crear Pinia de prueba
export function createTestPinia() {
  return createPinia()
}

// Función helper para montar componentes con configuración común
export function mountComponent(component, options = {}) {
  const {
    props = {},
    slots = {},
    global = {},
    ...mountOptions
  } = options

  const defaultGlobal = {
    plugins: [createTestPinia(), createTestRouter()],
    stubs: {
      'router-link': true,
      'router-view': true,
      'font-awesome-icon': true
    },
    mocks: {
      $router: {
        push: vi.fn(),
        replace: vi.fn(),
        go: vi.fn(),
        back: vi.fn(),
        forward: vi.fn()
      },
      $route: {
        path: '/',
        name: 'home',
        params: {},
        query: {},
        hash: '',
        fullPath: '/',
        matched: [],
        meta: {}
      }
    },
    ...global
  }

  return mount(component, {
    props,
    slots,
    global: defaultGlobal,
    ...mountOptions
  })
}

// Helper para simular eventos de usuario
export const userEvent = {
  click: (element) => element.trigger('click'),
  input: (element, value) => element.setValue(value),
  change: (element, value) => element.setValue(value),
  keydown: (element, key) => element.trigger('keydown', { key }),
  submit: (element) => element.trigger('submit')
}

// Helper para esperar a que se resuelvan promesas
export async function flushPromises() {
  await new Promise(resolve => setTimeout(resolve, 0))
}

// Helper para simular delay
export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Helper para crear datos mock
export const mockData = {
  cliente: {
    id: 1,
    cedula_rif: 'V12345678',
    nombre: 'Juan',
    apellido: 'Pérez',
    email: 'juan@email.com',
    telefono: '04141234567'
  },
  producto: {
    id: 1,
    sku: 'PROD001',
    nombre: 'Producto Test',
    precio_usd: 100.00,
    stock_actual: 10
  },
  pedido: {
    id: 1,
    cliente_cedula: 'V12345678',
    cliente_nombre: 'Juan',
    cliente_apellido: 'Pérez',
    total_usd: 100.00,
    estado_entrega: 'pendiente',
    fecha_pedido: new Date().toISOString()
  }
}

// Helper para simular respuestas de API
export function mockApiResponse(data, error = null) {
  return {
    data,
    error,
    status: error ? 400 : 200,
    statusText: error ? 'Bad Request' : 'OK'
  }
}

// Helper para simular errores de API
export function mockApiError(message = 'Error de prueba') {
  return {
    data: null,
    error: { message },
    status: 400,
    statusText: 'Bad Request'
  }
}
