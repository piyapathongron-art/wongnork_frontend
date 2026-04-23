import generatePayload from 'promptpay-qr';

/**
 * Utility to generate PromptPay QR code payload using the official promptpay-qr library
 * @param {string} number - Mobile number (10 digits) or ID Card (13 digits)
 * @param {number} amount - Amount to be paid
 * @returns {string} - EMVCo compliant payload for QR generation
 */
export function generatePromptPayPayload(number, amount) {
    if (!number) return '';
    
    // Clean the number (keep only digits)
    const cleanedNumber = number.replace(/[^0-9]/g, '');
    
    // Use the library to generate the payload
    // It handles mobile numbers and National IDs correctly
    return generatePayload(cleanedNumber, { amount: parseFloat(amount) });
}
