import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchCountries, fetchRates } from '../services/currencyService';

const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(() => {
    try { 
      return localStorage.getItem('currency') || 'USD'; 
    } catch (e) { 
      return 'USD'; 
    }
  });
  
  const [countries, setCountries] = useState([]);
  const [rates, setRates] = useState({});
  const [loadingCountries, setLoadingCountries] = useState(false);

  useEffect(() => {
    // Load countries once
    const loadCountries = async () => {
      setLoadingCountries(true);
      try {
        const data = await fetchCountries();
        setCountries(data);
      } catch (e) {
        console.error('Failed to load countries', e);
      } finally {
        setLoadingCountries(false);
      }
    };
    loadCountries();
  }, []);

  useEffect(() => {
    try { 
      localStorage.setItem('currency', currency); 
    } catch (e) {
      console.error('Failed to save currency to localStorage', e);
    }
  }, [currency]);

  const updateCurrency = async (newCurrency) => {
    setCurrency(newCurrency);
    // Fetch rates for the selected currency as base
    try {
      const r = await fetchRates(newCurrency);
      setRates(r);
    } catch (e) {
      console.error('Failed to fetch exchange rates', e);
    }
  };

  return (
    <CurrencyContext.Provider 
      value={{ 
        currency, 
        setCurrency: updateCurrency, 
        countries, 
        rates, 
        loadingCountries 
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    throw new Error('useCurrency must be used within CurrencyProvider');
  }
  return ctx;
};

export default CurrencyContext;

