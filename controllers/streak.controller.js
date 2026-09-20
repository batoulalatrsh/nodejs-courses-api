const User = require("../models/user.model");
const { calculateStreak } = require("../utils/streakCalculator");

exports.updateStreakOnActivity = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error(`There is no user with this ID: ${userId}`);
  }

  const updated = calculateStreak(user.streak);

  user.streak = updated;
  await user.save();
  return user;
};
