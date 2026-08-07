const crypto = require('crypto');

const { Survey } = require('../models');

const SLUG_LENGTH = 10;
const MAX_ATTEMPTS = 5;

function createSlug() {
  return crypto.randomBytes(12).toString('base64url').slice(0, SLUG_LENGTH);
}

async function generateUniqueSlug() {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const slug = createSlug();
    const existing = await Survey.findOne({ where: { shareSlug: slug } });

    if (!existing) {
      return slug;
    }
  }

  throw new Error('Could not generate a unique share link, please try again');
}

module.exports = { generateUniqueSlug };
