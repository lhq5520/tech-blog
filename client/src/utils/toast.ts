import { toast } from 'react-toastify';

export const showSuccess = (message: string) => {
  toast.success(message, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    className: 'custom-toast-success',
  });
};

export const showError = (message: string, details?: string) => {
  const errorMessage = details 
    ? `${message}\n\nDetails: ${details}` 
    : message;
  
  toast.error(errorMessage, {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    className: 'custom-toast-error',
    style: {
      whiteSpace: 'pre-line',
    },
  });
};

export const showInfo = (message: string) => {
  toast.info(message, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    className: 'custom-toast-info',
  });
};

export const showWarning = (message: string) => {
  toast.warning(message, {
    position: "top-right",
    autoClose: 4000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    className: 'custom-toast-warning',
  });
};
