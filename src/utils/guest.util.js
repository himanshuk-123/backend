import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a unique guest ID
 * @returns {string} Unique guest ID
 */
export const generateGuestId = () => {
  return uuidv4();
};

/**
 * Validate guest ID format
 * @param {string} guestId - Guest ID to validate
 * @returns {boolean} True if valid UUID format
 */
export const isValidGuestId = (guestId) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(guestId);
};




