import { env } from '../config/env.js';

export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  const response = {
    success: false,
    message: err.message || 'Internal Server Error',
    errors: err.errors || []
  };

  // Stack trace only shown in development mode
  if (env.nodeEnv === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};
