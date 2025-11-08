import axios from 'axios';

const COUNTRIES_URL = 'https://restcountries.com/v3.1/all?fields=name,currencies,cca2';
const RATES_URL = (base) => `https://api.exchangerate-api.com/v4/latest/${base}`;

let countriesCache = null;
let ratesCache = {};

export const fetchCountries = async () => {
  if (countriesCache) return countriesCache;
  
  try {
    const res = await axios.get(COUNTRIES_URL);
    // Normalize to { code, name, currency }
    const list = res.data.map(item => {
      const code = item.cca2 || (item.name && item.name.common && item.name.common.slice(0, 2).toUpperCase());
      const name = item.name?.common || '';
      const currencies = item.currencies ? Object.keys(item.currencies) : [];
      return {
        code,
        name,
        currency: currencies[0] || 'USD'
      };
    }).filter(Boolean);
    
    // Dedupe by code
    const map = new Map();
    list.forEach(c => { 
      if (c.code) map.set(c.code, c); 
    });
    
    countriesCache = Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
    return countriesCache;
  } catch (error) {
    console.error('Error fetching countries:', error);
    // Return fallback country list if API fails
    return getFallbackCountries();
  }
};

export const fetchRates = async (base = 'USD') => {
  if (ratesCache[base]) return ratesCache[base];
  
  try {
    const res = await axios.get(RATES_URL(base));
    ratesCache[base] = res.data.rates || {};
    return ratesCache[base];
  } catch (error) {
    console.error('Error fetching rates:', error);
    return {};
  }
};

// Convert amount from base currency to target currency
export const convertAmount = async (amount, baseCurrency, targetCurrency) => {
  if (!baseCurrency || !targetCurrency || baseCurrency === targetCurrency) {
    return amount;
  }
  
  const rates = await fetchRates(baseCurrency);
  const rate = rates[targetCurrency];
  if (!rate) return amount;
  return amount * rate;
};

// Fallback country list in case API is unavailable
const getFallbackCountries = () => {
  return [
    { code: 'US', name: 'United States', currency: 'USD' },
    { code: 'IN', name: 'India', currency: 'INR' },
    { code: 'GB', name: 'United Kingdom', currency: 'GBP' },
    { code: 'CA', name: 'Canada', currency: 'CAD' },
    { code: 'AU', name: 'Australia', currency: 'AUD' },
    { code: 'DE', name: 'Germany', currency: 'EUR' },
    { code: 'FR', name: 'France', currency: 'EUR' },
    { code: 'JP', name: 'Japan', currency: 'JPY' },
    { code: 'CN', name: 'China', currency: 'CNY' },
    { code: 'BR', name: 'Brazil', currency: 'BRL' }
  ].sort((a, b) => a.name.localeCompare(b.name));
};

export default {
  fetchCountries,
  fetchRates,
  convertAmount
};

