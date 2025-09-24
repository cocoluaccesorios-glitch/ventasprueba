// utils/forceModalZIndex.js
// Script para forzar que los modales tengan el z-index más alto posible

export function forceModalZIndex() {
  // Función para aplicar z-index máximo a elementos de modales
  const applyMaxZIndex = (element) => {
    if (element) {
      element.style.setProperty('z-index', '2147483647', 'important');
      element.style.setProperty('position', 'fixed', 'important');
    }
  };

  // Función para resetear z-index de otros elementos
  const resetOtherZIndex = () => {
    const elementsToReset = [
      '.navbar',
      '.sidebar', 
      '.header',
      '.card',
      '.tooltip',
      '.popover'
    ];

    elementsToReset.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        if (!el.closest('.modal-superior-definitivo') && 
            !el.closest('.modal-contenido-definitivo') &&
            !el.closest('.swal2-container') &&
            !el.classList.contains('dropdown') &&
            !el.classList.contains('dropdown-menu')) {
          el.style.setProperty('z-index', '1000', 'important');
        }
      });
    });

    // Aplicar z-index alto específicamente a dropdowns
    const dropdowns = document.querySelectorAll('.dropdown, .dropdown-menu, .dropdown-toggle');
    dropdowns.forEach(el => {
      el.style.setProperty('z-index', '2147483647', 'important');
    });
  };

  // Observador para detectar cuando se abren modales
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          // Detectar modal personalizado
          if (node.classList && node.classList.contains('modal-superior-definitivo')) {
            applyMaxZIndex(node);
            const content = node.querySelector('.modal-contenido-definitivo');
            if (content) {
              applyMaxZIndex(content);
            }
          }

          // Detectar SweetAlert
          if (node.classList && node.classList.contains('swal2-container')) {
            applyMaxZIndex(node);
            const popup = node.querySelector('.swal2-popup');
            if (popup) {
              applyMaxZIndex(popup);
            }
          }

          // Detectar Bootstrap modals
          if (node.classList && node.classList.contains('modal')) {
            applyMaxZIndex(node);
          }
        }
      });
    });
  });

  // Iniciar observación
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Aplicar estilos inmediatamente a elementos existentes
  const existingModals = document.querySelectorAll(`
    .modal-superior-definitivo,
    .modal-contenido-definitivo,
    .swal2-container,
    .swal2-popup,
    .modal
  `);

  existingModals.forEach(applyMaxZIndex);

  // Resetear otros elementos
  resetOtherZIndex();

  // Función para forzar z-index cuando se abre un modal específico
  window.forceModalOnTop = (modalElement) => {
    if (modalElement) {
      applyMaxZIndex(modalElement);
      
      // Buscar elementos hijos
      const children = modalElement.querySelectorAll('*');
      children.forEach(child => {
        if (child.classList.contains('modal-contenido-definitivo') ||
            child.classList.contains('swal2-popup')) {
          applyMaxZIndex(child);
        }
      });
    }
  };

  console.log('🔧 ForceModalZIndex: Script activado - Los modales ahora tendrán z-index máximo');
}

// Función para aplicar estilos CSS directamente
export function injectModalStyles() {
  const style = document.createElement('style');
  style.textContent = `
    /* Estilos forzados para modales */
    .modal-superior-definitivo,
    .modal-superior-definitivo * {
      z-index: 2147483647 !important;
      position: fixed !important;
    }
    
    .modal-contenido-definitivo,
    .modal-contenido-definitivo * {
      z-index: 2147483647 !important;
      position: relative !important;
    }
    
    .swal2-container,
    .swal2-container *,
    .swal2-popup,
    .swal2-popup * {
      z-index: 2147483647 !important;
    }
    
    /* Resetear otros elementos */
    .navbar,
    .navbar *,
    .sidebar,
    .sidebar *,
    .header,
    .header *,
    .card,
    .card * {
      z-index: 1000 !important;
    }
    
    /* Dropdowns con z-index alto */
    .dropdown,
    .dropdown *,
    .dropdown-menu,
    .dropdown-menu *,
    .dropdown-toggle,
    .dropdown-toggle * {
      z-index: 2147483647 !important;
    }
    
    /* Asegurar que el modal esté por encima de todo */
    body {
      overflow: visible !important;
    }
  `;
  
  document.head.appendChild(style);
  console.log('🎨 ModalStyles: Estilos CSS inyectados directamente');
}

// Auto-ejecutar cuando se carga el módulo
if (typeof window !== 'undefined') {
  injectModalStyles();
  forceModalZIndex();
}
