const Project = require('../models/Project');

// POST /api/projects
const createProject = async (req, res) => {
  try {
    const { name, description, members } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Project name is required' });
    }

    const project = await Project.create({
      name,
      description: description || '',
      creator: req.user._id,
      members: members || [],
    });

    const populated = await project.populate([
      { path: 'creator', select: 'name email' },
      { path: 'members', select: 'name email' },
    ]);

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/projects
const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [{ creator: req.user._id }, { members: req.user._id }],
    })
      .populate('creator', 'name email')
      .populate('members', 'name email')
      .sort({ updatedAt: -1 });

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/projects/:id
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('creator', 'name email')
      .populate('members', 'name email');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/projects/:id/members/add
const addMember = async (req, res) => {
  try {
    let { memberId, email } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the project creator can manage members' });
    }

    // If email is provided instead of memberId, look up the user
    if (!memberId && email) {
      const User = require('../models/User');
      const foundUser = await User.findOne({ email: email.toLowerCase().trim() });
      if (!foundUser) {
        return res.status(404).json({ message: `No registered user found with email "${email}". Ask them to sign up first.` });
      }
      memberId = foundUser._id.toString();
    }

    if (!memberId) {
      return res.status(400).json({ message: 'Please provide a member ID or email address' });
    }

    if (project.creator.toString() === memberId) {
      return res.status(400).json({ message: 'The project creator is already the owner' });
    }

    if (project.members.map(m => m.toString()).includes(memberId)) {
      return res.status(400).json({ message: 'User is already a member of this project' });
    }

    project.members.push(memberId);
    await project.save();

    const populated = await project.populate([
      { path: 'creator', select: 'name email' },
      { path: 'members', select: 'name email' },
    ]);

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/projects/:id/members/remove
const removeMember = async (req, res) => {
  try {
    const { memberId } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the project creator can manage members' });
    }

    project.members = project.members.filter((id) => id.toString() !== memberId);
    await project.save();

    const populated = await project.populate([
      { path: 'creator', select: 'name email' },
      { path: 'members', select: 'name email' },
    ]);

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createProject, getProjects, getProjectById, addMember, removeMember };
