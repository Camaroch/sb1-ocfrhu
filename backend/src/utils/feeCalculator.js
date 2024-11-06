export const calculateFees = (price) => {
  // Platform fee is 20%
  const platformFeePercentage = 0.20;
  const platformFee = price * platformFeePercentage;
  const sellerEarnings = price - platformFee;

  return {
    price,
    platformFee,
    sellerEarnings
  }
};