// shopController.js 
const User = require('../models/User');
const Product = require('../models/Product');
const Review = require('../models/Review');
const Transaction = require('../models/Transaction');
async function getAnalyticsData() {
  const [userCount, productCount, reviewCount, transactionCount] = await Promise.all([
    User.countDocuments(),
    Product.countDocuments(),
    Review.countDocuments(),
    Transaction.countDocuments(),
  ]);

  return {
    users: userCount,
    products: productCount,
    reviews: reviewCount,
    transactions: transactionCount,
  };
}

module.exports = { getAnalyticsData };