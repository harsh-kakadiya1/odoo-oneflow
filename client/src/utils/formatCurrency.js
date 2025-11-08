// Currency formatting utility - Hardcoded to Indian Rupees (INR)

/**
 * Format amount to Indian Rupees
 * @param {number} amount - The amount to format
 * @param {boolean} showSymbol - Whether to show ₹ symbol (default: true)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount || 0);
};

/**
 * Format amount without symbol
 * @param {number} amount - The amount to format
 * @returns {string} Formatted number string
 */
export const formatAmount = (amount) => {
  return `₹${Number(amount || 0).toLocaleString('en-IN')}`;
};

export default formatCurrency;

