import express from 'express';
import { createFeedback } from '../controllers/feedbackController.js';

const router = express.Router();

router.route('/').post(createFeedback);

export default router;
