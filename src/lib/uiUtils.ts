
import Swal from 'sweetalert2';

export const swalLux = (icon: 'success' | 'error' | 'warning' | 'info' | 'question', title: string, text?: string, options: any = {}, styles: any = {}) => {
    return Swal.fire({
        icon,
        title,
        text,
        customClass: {
            popup: styles.swalPopup,
            title: styles.swalTitle,
            htmlContainer: styles.swalText,
            confirmButton: styles.swalConfirmButton,
            cancelButton: styles.swalCancelButton,
            input: styles.swalSelect
        },
        buttonsStyling: false,
        confirmButtonText: 'OK',
        background: '#1A0F0A',
        color: '#ffffff',
        didOpen: (popup) => {
            // Force high z-index to stay above other modals on mobile
            const container = Swal.getContainer();
            if (container) container.style.zIndex = '99999';
            if (options.didOpen) options.didOpen(popup);
        },
        ...options
    });
};

export const formatDate = (date: string | Date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};
