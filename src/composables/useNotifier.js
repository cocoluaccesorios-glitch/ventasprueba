// composables/useNotifier.js
import Swal from 'sweetalert2';

export function useNotifier() {
  const showSuccess = (title, text = '') => {
    return Swal.fire({
      title,
      text,
      icon: 'success',
      confirmButtonText: 'Continuar'
    });
  };

  const showError = (title, text = '') => {
    return Swal.fire({
      title,
      text,
      icon: 'error',
      confirmButtonText: 'Entendido'
    });
  };

  const showWarning = (title, text = '') => {
    return Swal.fire({
      title,
      text,
      icon: 'warning',
      confirmButtonText: 'Entendido'
    });
  };

  const showInfo = (title, text = '') => {
    return Swal.fire({
      title,
      text,
      icon: 'info',
      confirmButtonText: 'Entendido'
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
      cancelButtonColor: '#dc3545'
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
