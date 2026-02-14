// frontend/src/utils/validators.js

export const validateAddress = (address) => {
  if (!address) return false;
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

export const validateAmount = (amount, min = 0, max = Infinity) => {
  if (!amount) return false;
  
  const num = parseFloat(amount);
  if (isNaN(num)) return false;
  if (num <= min) return false;
  if (num > max) return false;
  
  return true;
};

export const validateInteger = (value, min = 0, max = Infinity) => {
  const num = parseInt(value);
  if (isNaN(num)) return false;
  if (num < min) return false;
  if (num > max) return false;
  
  return true;
};

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const validateAssetType = (type) => {
  const validTypes = [
    'Real Estate',
    'Stocks',
    'Commodities',
    'Bonds',
    'Crypto',
    'Private Equity'
  ];
  return validTypes.includes(type);
};

export const validateRiskProfile = (profile) => {
  const validProfiles = ['Conservative', 'Moderate', 'Aggressive'];
  return validProfiles.includes(profile);
};

export const validateNetwork = (chainId) => {
  const validNetworks = [11155111, 80001]; // Sepolia, Mumbai
  return validNetworks.includes(chainId);
};

export const sanitizeInput = (input) => {
  if (!input) return '';
  
  // Remove any script tags
  let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Escape HTML
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
  
  return sanitized;
};
