export const formatPrice = (amount: number): string => {
    const formatted = new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);

    return formatted.includes('MXN') ? formatted : `${formatted} MXN`;
};

export const createSlug = (text: string): string => {
    return text
        .toString()
        .normalize('NFD') // Normalize accents
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-') // Replace spaces with -
        .replace(/[^\w-]+/g, '') // Remove all non-word chars
        .replace(/--+/g, '-'); // Replace multiple - with single -
};
