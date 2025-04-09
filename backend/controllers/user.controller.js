const User = require("../models/User");
const { validationResult } = require("express-validator");

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    // Handle role filtering for single or multiple roles
    let query = {};

    if (req.query.role) {
      if (req.query.role.includes(",")) {
        // Convert comma-separated string to array for OR query
        const roles = req.query.role.split(",");
        query.role = { $in: roles };
      } else {
        query.role = req.query.role;
      }
    }

    // Get users based on query
    const users = await User.find(query).select("-password").sort("name");

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: `User not found with id of ${req.params.id}`,
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    // Check if error is a valid MongoDB ObjectId
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        error: "Invalid user ID format",
      });
    }

    next(error);
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res, next) => {
  try {
    // Only allow admins to update user roles
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Not authorized to update users",
      });
    }

    // Find the user by ID
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Only allow updating role for now
    if (req.body.role) {
      // Validate that the role is one of the allowed values
      const allowedRoles = [
        "user",
        "admin",
        "firstLineSupport",
        "secondLineSupport",
      ];
      if (!allowedRoles.includes(req.body.role)) {
        return res.status(400).json({
          success: false,
          error: "Invalid role specified",
        });
      }

      user.role = req.body.role;
      await user.save();
    }

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: `User not found with id of ${req.params.id}`,
      });
    }

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    // Check if error is a valid MongoDB ObjectId
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        error: "Invalid user ID format",
      });
    }

    next(error);
  }
};

// @desc    Promote a user to admin
// @route   PUT /api/users/promote
// @access  Private/Admin
exports.promoteUser = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Please provide an email address",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found with that email address",
      });
    }

    if (user.role === "admin") {
      return res.status(400).json({
        success: false,
        error: "User is already an admin",
      });
    }

    user.role = "admin";
    await user.save();

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
