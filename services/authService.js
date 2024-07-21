


const { executeQuery } = require('../db'); 

const generateVerificationCode = async (email) => {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 6 * 60000); 

  const query = `
    INSERT INTO email_verifications (email, code, created_at, expires_at)
    VALUES (?, ?, CURRENT_TIMESTAMP, ?)
    ON DUPLICATE KEY UPDATE code = VALUES(code), created_at = CURRENT_TIMESTAMP, expires_at = VALUES(expires_at)
  `;
  await executeQuery(query, [email, code, expiresAt]);

  
};

module.exports = {
  generateVerificationCode
};
