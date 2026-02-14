// frontend/src/utils/errors.js

export class AegisError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = 'AegisError';
    this.code = code;
    this.details = details;
    this.timestamp = Date.now();
  }
}

export const ErrorCodes = {
  // Wallet errors (1000-1999)
  WALLET_NOT_CONNECTED: 1001,
  NETWORK_MISMATCH: 1002,
  INSUFFICIENT_FUNDS: 1003,
  TRANSACTION_REJECTED: 1004,
  
  // Contract errors (2000-2999)
  CONTRACT_NOT_FOUND: 2001,
  FUNCTION_CALL_FAILED: 2002,
  GAS_ESTIMATION_FAILED: 2003,
  
  // AI errors (3000-3999)
  AI_REQUEST_FAILED: 3001,
  AI_TIMEOUT: 3002,
  AI_INVALID_RESPONSE: 3003,
  SUBSCRIPTION_INACTIVE: 3004,
  
  // Validation errors (4000-4999)
  INVALID_ADDRESS: 4001,
  INVALID_AMOUNT: 4002,
  INVALID_INPUT: 4003,
  
  // Unknown
  UNKNOWN_ERROR: 9999
};

export const ErrorMessages = {
  [ErrorCodes.WALLET_NOT_CONNECTED]: 'Please connect your wallet first',
  [ErrorCodes.NETWORK_MISMATCH]: 'Please switch to Sepolia or Mumbai testnet',
  [ErrorCodes.INSUFFICIENT_FUNDS]: 'Insufficient balance for transaction',
  [ErrorCodes.TRANSACTION_REJECTED]: 'Transaction was rejected',
  
  [ErrorCodes.CONTRACT_NOT_FOUND]: 'Contract not found on this network',
  [ErrorCodes.FUNCTION_CALL_FAILED]: 'Smart contract function call failed',
  
  [ErrorCodes.AI_REQUEST_FAILED]: 'AI request failed. Please try again',
  [ErrorCodes.AI_TIMEOUT]: 'AI response timeout. Try again later',
  [ErrorCodes.SUBSCRIPTION_INACTIVE]: 'AI subscription is inactive',
  
  [ErrorCodes.INVALID_ADDRESS]: 'Invalid Ethereum address',
  [ErrorCodes.INVALID_AMOUNT]: 'Invalid amount',
  
  [ErrorCodes.UNKNOWN_ERROR]: 'An unknown error occurred'
};

export const handleError = (error) => {
  console.error('Error:', error);
  
  // MetaMask errors
  if (error.code === 4001) {
    return {
      message: ErrorMessages[ErrorCodes.TRANSACTION_REJECTED],
      code: ErrorCodes.TRANSACTION_REJECTED
    };
  }
  
  if (error.code === -32603) {
    if (error.message.includes('insufficient funds')) {
      return {
        message: ErrorMessages[ErrorCodes.INSUFFICIENT_FUNDS],
        code: ErrorCodes.INSUFFICIENT_FUNDS
      };
    }
  }
  
  // Our custom errors
  if (error instanceof AegisError) {
    return {
      message: error.message,
      code: error.code,
      details: error.details
    };
  }
  
  // Unknown errors
  return {
    message: error.message || ErrorMessages[ErrorCodes.UNKNOWN_ERROR],
    code: ErrorCodes.UNKNOWN_ERROR,
    original: error
  };
};

export const createError = (code, details = {}) => {
  return new AegisError(
    ErrorMessages[code] || 'Unknown error',
    code,
    details
  );
};

export const isUserRejection = (error) => {
  return error.code === 4001 || error.message?.includes('user rejected');
};

export const isNetworkError = (error) => {
  return error.message?.includes('network') || error.code === -32603;
};
