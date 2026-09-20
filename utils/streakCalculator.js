const isSameDay = (d1, d2) =>
  d1.getFullYear() === d2.getFullYear() &&
  d1.getMonth() === d2.getMonth() &&
  d1.getDate() === d2.getDate();

const isYesterDay = (lastDay, today) => {
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(yesterday, lastDay);
};

exports.calculateStreak = ({ currentStreak, longestStreak, lastActiveDay }) => {
  const today = new Date();
  // 1) No previous activity → start streak at 1
  if (!lastActiveDay) {
    return {
      currentStreak: 1,
      longestStreak: Math.max(1, longestStreak),
      lastActiveDay: today,
    };
  }
  // 2) Last activity was today already → don't increment (avoid double-counting same-day actions)
  if (isSameDay(new Date(lastActiveDay), today)) {
    return {
      currentStreak,
      longestStreak,
      lastActiveDay: today,
    };
  }
  // 3) Last activity was exactly yesterday → increment streak, update longest if needed
  if (isYesterDay(new Date(lastActiveDay), today)) {
    const newStreak = currentStreak + 1;
    return {
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, longestStreak),
      lastActiveDay: today,
    };
  }
  // 4) Last activity was more than 1 day ago → reset streak to 1
  return {
    currentStreak: 1,
    longestStreak: longestStreak,
    lastActiveDay: today,
  };
};
