const express = require('express');
const router = express.Router();
const {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  getDashboardStats,
} = require('../controllers/taskController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').post(protect, admin, createTask).get(protect, getTasks);
router.route('/stats').get(protect, getDashboardStats);
router.route('/:id').put(protect, updateTask).delete(protect, admin, deleteTask);

module.exports = router;
