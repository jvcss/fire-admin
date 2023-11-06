import { Response } from 'express';

function handleError(error: any, res?: Response) {
  if (!res) {
    console.error('An error occurred:', error);
  }
  console.error('Error retrieving apps:', error);
  let statusCode = 500; // Default status code for internal server error
  let errorMessage = 'Failed to retrieve apps for the project';

  if (error instanceof Error) {
    if (error.message.includes('ECONNREFUSED')) {
      statusCode = 503; // Service Unavailable
      errorMessage = 'Service is unavailable';
    } else if (error.message.includes('ETIMEDOUT')) {
      statusCode = 504; // Gateway Timeout
      errorMessage = 'Request timeout';
    } else if (error.message.includes('404')) {
      statusCode = 404; // Not Found
      errorMessage = 'Resource not found';
    } else if (error.message.includes('ENOENT')) {
      statusCode = 404; // Not Found
      errorMessage = 'File not found';
    } else if (error.message.includes('EACCES')) {
      statusCode = 403; // Forbidden
      errorMessage = 'Permission denied';
    } else if (error instanceof RangeError) {
      statusCode = 400; // Bad Request
      errorMessage = 'Invalid range';
    } else if (error.message.includes('ENOTFOUND')) {
      statusCode = 404; // Not Found
      errorMessage = 'Host not found';
    } else if (error instanceof TypeError) {
      statusCode = 400; // Bad Request
      errorMessage = 'Type error';
    } else if (error.message.includes('ECONNRESET')) {
      statusCode = 503; // Service Unavailable
      errorMessage = 'Connection reset';
    }
    // Add more specific error cases as needed
  }

  res!.status(statusCode).json({ error: errorMessage });
}

export { handleError };
