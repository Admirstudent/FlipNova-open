const express = require('express');
const crypto = require('crypto');
const router = express.Router();

// Must match exactly what you entered in the eBay dashboard
const VERIFICATION_TOKEN = 'flipnova-ebay-marketplace-verification-token-2026';

// The endpoint URL you provided to eBay
const ENDPOINT_URL = 'https://flipnova-backend-dafe7abc760b.herokuapp.com/ebay-deletion';

/**
 * eBay Marketplace Account Deletion – verification challenge (GET).
 * eBay sends a GET with ?challenge_code=...
 * We must hash (challengeCode + verificationToken + endpoint) and return it.
 */
router.get('/ebay-deletion', (req, res) => {
  const challengeCode = req.query.challenge_code;
  if (!challengeCode) {
    return res.status(400).json({ error: 'Missing challenge_code' });
  }

  // SHA‑256 hash of the three concatenated strings
  const hash = crypto.createHash('sha256');
  hash.update(challengeCode);
  hash.update(VERIFICATION_TOKEN);
  hash.update(ENDPOINT_URL);
  const responseHash = hash.digest('hex');

  console.log('eBay verification challenge:', challengeCode);
  console.log('Responding with hash:', responseHash);

  res.set('Content-Type', 'application/json');
  return res.json({ challengeResponse: responseHash });
});

/**
 * eBay Marketplace Account Deletion – actual notifications (POST).
 */
router.post('/ebay-deletion', (req, res) => {
  console.log('eBay deletion notification received:', req.body);
  // TODO: Process the notification (delete user data, etc.)
  res.status(200).send('OK');
});

module.exports = router;