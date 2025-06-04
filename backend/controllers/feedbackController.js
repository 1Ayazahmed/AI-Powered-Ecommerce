import asyncHandler from '../middlewares/asyncHandler.js';
import Feedback from '../models/feedbackModel.js';

const createFeedback = asyncHandler(async (req, res) => {
  const { product, user, rating, comment } = req.body;

  // Basic validation
  if (!product || !user || !rating || !comment) {
    res.status(400);
    throw new Error('Please provide product, user, rating, and comment.');
  }

  const feedback = new Feedback({
    product,
    user,
    rating,
    comment,
  });

  const createdFeedback = await feedback.save();
  res.status(201).json(createdFeedback);
});

export { createFeedback }; 