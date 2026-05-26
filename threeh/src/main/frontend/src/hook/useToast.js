import React from 'react';
import { toast } from 'react-toastify';

export const useToast = () => {

    const success = (message, options ={}) => {
        toast.success(message, {
            ...options,
        });
    }

    const error = (message, options ={}) => {
        toast.error(message, {
            ...options,
        });
    }
    const warn = (message, options ={}) => {
        toast.warn(message, {
            ...options,
        });
    }
    const info = (message, options ={}) => {
        toast.info(message, {
            ...options,
        });
    }
    return {success, error, warn, info};
};

