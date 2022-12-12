/**
 * @description update messages  on the user message array
 * @param {String} statusCode - The status code of the response
 * @param {String} errorMessage - The error message of the response
 * @returns {Object} - The error object
 */
export default function makeHttpError({ statusCode, errorMessage }) {
  return {
    headers: {
      "Content-Type": "application/json",
    },
    statusCode,
    data: JSON.stringify({
      success: false,
      error: errorMessage,
    }),
  };
}
