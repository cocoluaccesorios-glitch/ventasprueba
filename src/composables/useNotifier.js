// composables/useNotifier.js
import Swal from 'sweetalert2';

export function useNotifier() {
  const showSuccess = (title, text = '') => {
    return Swal.fire({
      title,
      text,
      icon: 'success',
      confirmButtonText: 'Continuar',
      position: 'center', // Centrar las alertas
      customClass: {
        container: 'swal2-container-high-z',
        popup: 'swal2-popup-high-z'
      },
      zIndex: 999999
    });
  };

  const showError = (title, text = '') => {
    return Swal.fire({
      title,
      text,
      icon: 'error',
      confirmButtonText: 'Entendido',
      position: 'center', // Centrar las alertas
      customClass: {
        container: 'swal2-container-high-z',
        popup: 'swal2-popup-high-z'
      },
      zIndex: 999999
    });
  };

  const showWarning = (title, text = '') => {
    return Swal.fire({
      title,
      text,
      icon: 'warning',
      confirmButtonText: 'Entendido',
      position: 'center', // Centrar las alertas
      customClass: {
        container: 'swal2-container-high-z',
        popup: 'swal2-popup-high-z'
      },
      zIndex: 999999
    });
  };

  const showInfo = (title, text = '') => {
    return Swal.fire({
      title,
      text,
      icon: 'info',
      confirmButtonText: 'Entendido',
      position: 'center', // Centrar las alertas
      customClass: {
        container: 'swal2-container-high-z',
        popup: 'swal2-popup-high-z'
      },
      zIndex: 999999
    });
  };

  const confirmAction = (title, text = '', confirmText = 'Sí, continuar', cancelText = 'Cancelar') => {
    return Swal.fire({
      title,
      text,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      confirmButtonColor: '#198754',
      cancelButtonColor: '#dc3545',
      position: 'center', // Centrar las alertas
      customClass: {
        container: 'swal2-container-high-z',
        popup: 'swal2-popup-high-z'
      },
      zIndex: 999999
    });
  };

  const confirmDelete = (itemName = 'este elemento') => {
    return confirmAction(
      '¿Estás seguro?',
      `¿Realmente quieres eliminar ${itemName}? Esta acción no se puede deshacer.`,
      'Sí, eliminar',
      'Cancelar'
    );
  };

  const showLoading = (title = 'Procesando...') => {
    return Swal.fire({
      title,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      position: 'center', // Centrar las alertas
      customClass: {
        container: 'swal2-container-high-z',
        popup: 'swal2-popup-high-z'
      },
      zIndex: 999999,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  };

  const closeLoading = () => {
    Swal.close();
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    confirmAction,
    confirmDelete,
    showLoading,
    closeLoading
  };
}
