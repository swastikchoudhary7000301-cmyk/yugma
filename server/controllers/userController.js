const User = require("../models/user");

const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(
      req.user.id
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json(user);
  } catch (error) {
    console.error("Get profile error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get profile",
    });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(
      req.params.id
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.profileViews += 1;
    await user.save();

    res.json(user);
  } catch (error) {
    console.error(
      "Get user profile error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to get user profile",
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(
      req.user.id
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const {
      name,
      headline,
      bio,
      location,
      skills,
      profilePicture,
    } = req.body;

    if (name !== undefined) {
      user.name = String(name).trim();
    }

    if (headline !== undefined) {
      user.headline =
        String(headline).trim();
    }

    if (bio !== undefined) {
      user.bio = String(bio).trim();
    }

    if (location !== undefined) {
      user.location =
        String(location).trim();
    }

    if (profilePicture !== undefined) {
      user.profilePicture =
        String(profilePicture).trim();
    }

    if (Array.isArray(skills)) {
      user.skills = skills
        .map((skill) =>
          String(skill).trim()
        )
        .filter(Boolean);
    }

    await user.save();

    res.json({
      success: true,
      message:
        "Profile updated successfully",
      user: {
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture:
          user.profilePicture,
        headline: user.headline,
        bio: user.bio,
        skills: user.skills,
        location: user.location,
        profileViews:
          user.profileViews,
      },
    });
  } catch (error) {
    console.error(
      "Update profile error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};

const searchUsers = async (req, res) => {
  try {
    const query =
      String(req.query.q || "").trim();

    if (!query) {
      return res.json({
        success: true,
        users: [],
      });
    }

    const users = await User.find({
      $or: [
        {
          name: {
            $regex: query,
            $options: "i",
          },
        },
        {
          headline: {
            $regex: query,
            $options: "i",
          },
        },
        {
          location: {
            $regex: query,
            $options: "i",
          },
        },
        {
          skills: {
            $regex: query,
            $options: "i",
          },
        },
      ],
      _id: {
        $ne: req.user.id,
      },
    })
      .select(
        "name email profilePicture headline location skills"
      )
      .limit(20);

    res.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Search users error:", error);

    res.status(500).json({
      success: false,
      message: "Search failed",
    });
  }
};

module.exports = {
  getMyProfile,
  getUserProfile,
  updateProfile,
  searchUsers,
};