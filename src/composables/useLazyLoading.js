import { ref, onMounted, onUnmounted, nextTick } from 'vue'

export function useLazyLoading() {
  const observer = ref(null)
  const observedElements = ref(new Set())
  
  // Función para crear observer
  function createObserver(options = {}) {
    const defaultOptions = {
      root: null,
      rootMargin: '50px',
      threshold: 0.1
    }
    
    const observerOptions = { ...defaultOptions, ...options }
    
    observer.value = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target
          const callback = element.dataset.lazyCallback
          
          if (callback && window[callback]) {
            window[callback](element)
          }
          
          // Disconnect observer for this element
          observer.value.unobserve(element)
          observedElements.value.delete(element)
        }
      })
    }, observerOptions)
  }
  
  // Función para observar elemento
  function observeElement(element, callback) {
    if (!observer.value) {
      createObserver()
    }
    
    // Guardar callback en el elemento
    const callbackName = `lazyCallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    element.dataset.lazyCallback = callbackName
    window[callbackName] = callback
    
    observer.value.observe(element)
    observedElements.value.add(element)
  }
  
  // Función para dejar de observar elemento
  function unobserveElement(element) {
    if (observer.value && observedElements.value.has(element)) {
      observer.value.unobserve(element)
      observedElements.value.delete(element)
      
      // Limpiar callback
      const callbackName = element.dataset.lazyCallback
      if (callbackName && window[callbackName]) {
        delete window[callbackName]
        delete element.dataset.lazyCallback
      }
    }
  }
  
  // Función para limpiar observer
  function disconnect() {
    if (observer.value) {
      observer.value.disconnect()
      observedElements.value.clear()
    }
  }
  
  // Cleanup al desmontar
  onUnmounted(() => {
    disconnect()
  })
  
  return {
    observeElement,
    unobserveElement,
    disconnect
  }
}

// Composable para lazy loading de imágenes
export function useLazyImages() {
  const { observeElement } = useLazyLoading()
  
  function lazyLoadImage(imgElement) {
    const src = imgElement.dataset.src
    const placeholder = imgElement.dataset.placeholder
    
    if (src) {
      // Mostrar placeholder mientras carga
      if (placeholder) {
        imgElement.src = placeholder
      }
      
      // Crear nueva imagen para precargar
      const newImg = new Image()
      newImg.onload = () => {
        imgElement.src = src
        imgElement.classList.add('loaded')
      }
      newImg.onerror = () => {
        imgElement.classList.add('error')
        if (imgElement.dataset.fallback) {
          imgElement.src = imgElement.dataset.fallback
        }
      }
      newImg.src = src
    }
  }
  
  function setupLazyImage(imgElement) {
    observeElement(imgElement, lazyLoadImage)
  }
  
  return {
    setupLazyImage
  }
}

// Composable para lazy loading de componentes
export function useLazyComponents() {
  const { observeElement } = useLazyLoading()
  const loadedComponents = ref(new Set())
  
  function lazyLoadComponent(containerElement) {
    const componentName = containerElement.dataset.component
    const props = containerElement.dataset.props ? JSON.parse(containerElement.dataset.props) : {}
    
    if (componentName && !loadedComponents.value.has(componentName)) {
      // Marcar como cargado
      loadedComponents.value.add(componentName)
      
      // Emitir evento para que el componente padre maneje la carga
      const event = new CustomEvent('lazy-component-load', {
        detail: { componentName, props, container: containerElement }
      })
      containerElement.dispatchEvent(event)
    }
  }
  
  function setupLazyComponent(containerElement) {
    observeElement(containerElement, lazyLoadComponent)
  }
  
  return {
    setupLazyComponent,
    loadedComponents
  }
}

// Composable para lazy loading de datos
export function useLazyData() {
  const { observeElement } = useLazyLoading()
  const loadedData = ref(new Set())
  
  function lazyLoadData(triggerElement) {
    const dataKey = triggerElement.dataset.dataKey
    const dataFunction = triggerElement.dataset.dataFunction
    
    if (dataKey && !loadedData.value.has(dataKey)) {
      loadedData.value.add(dataKey)
      
      // Emitir evento para cargar datos
      const event = new CustomEvent('lazy-data-load', {
        detail: { dataKey, dataFunction, trigger: triggerElement }
      })
      triggerElement.dispatchEvent(event)
    }
  }
  
  function setupLazyData(triggerElement) {
    observeElement(triggerElement, lazyLoadData)
  }
  
  return {
    setupLazyData,
    loadedData
  }
}
