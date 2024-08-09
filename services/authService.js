const email_verifications = require('../models/email_verifications');
const executeQuery = require('../utils/executeQuery');


const generateVerificationCode = async (email) => {
  const code = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit random code
  const expiresAt = new Date(Date.now() + 6 * 60000); // Set expiry to 6 minutes from now

  // Using `updateOne` with `upsert` to either update an existing document or insert a new one
  await executeQuery(() =>
    email_verifications.updateOne(
      { email }, // Filter by email
      { email, code, created_at: new Date(), expires_at: expiresAt }, // Update or insert these fields
      { upsert: true } // Create a new document if no matching document is found
    )
  );

  return code; // Return the generated code
};

module.exports = {
  generateVerificationCode,
};
