const express = require('express');
const router = express.Router();
const {
  createProject,
  getProjects,
  getProjectById,
  addMember,
  removeMember,
} = require('../controllers/projectController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').post(protect, admin, createProject).get(protect, getProjects);
router.route('/:id').get(protect, getProjectById);
router.route('/:id/members/add').put(protect, admin, addMember);
router.route('/:id/members/remove').put(protect, admin, removeMember);

module.exports = router;
