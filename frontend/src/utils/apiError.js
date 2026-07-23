export function getApiErrorMessage(error, fallback = 'An error occurred. Please try again.') {
  const response = error?.response?.data;
  if (!response) return fallback;
  if (Array.isArray(response.errors) && response.errors.length > 0) {
    return response.errors[0].message;
  }
  return response.message || fallback;
}
