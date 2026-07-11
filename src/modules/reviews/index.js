// reviews — product reviews. Validates the product exists via catalog.
const catalog = require('../catalog');

const reviews = [];

function addReview(sku, rating, text) {
  catalog.getProduct(sku); // throws for unknown products
  if (rating < 1 || rating > 5) throw new Error('Rating must be 1-5');
  const review = { sku, rating, text, at: new Date().toISOString() };
  reviews.push(review);
  return review;
}

function reviewsFor(sku) {
  return reviews.filter((r) => r.sku === sku);
}

module.exports = { addReview, reviewsFor };
