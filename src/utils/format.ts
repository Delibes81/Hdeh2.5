export const formatPrice = (amount: number): string => {
    const formatted = new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);

    // El formateador nativo 'es-MX' a veces pone sólo "$" 
    // Agregamos explícitamente "MXN" si no aparece
    return formatted.includes('MXN') ? formatted : `${formatted} MXN`;
};
