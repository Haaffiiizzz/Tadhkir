import AsyncStorage from "@react-native-async-storage/async-storage";

const formatDate = (date: Date) => {
    /**
     * Function to convert date object to dd-mm-yyyy format
     */
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };

export async function calculateCurrentStreak(streakStorage: Record<string, boolean>) {
  const today = new Date();
  const maxStreak = Number(await AsyncStorage.getItem("maxStreak"))

  let startDate = new Date(today);
  const todayKey = formatDate(today);
  // If today is not marked true, start from yesterday
  if (!streakStorage[todayKey]) {
    startDate.setDate(startDate.getDate() - 1);
  }

  let streak = 0;
  for (let i = 0; ; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() - i);
    const key = formatDate(date);

    if (streakStorage[key]) {
      streak++;
    } else {
      break;
    }
  }

  if (streak > maxStreak) {
    await AsyncStorage.setItem("maxStreak", String(streak))
  }
  return streak;
}

export function calculateMaxStreak(streakStorage: Record<string, boolean>) {
  let maxStreak = 0;
  let currentStreak = 0;

  // Find the earliest date in streakStorage
  const allDates = Object.keys(streakStorage);
  if (allDates.length === 0) return 0;

  const [firstDay, firstMonth, firstYear] = allDates[0].split('-').map(Number);
  let currentDate = new Date(firstYear, firstMonth - 1, firstDay);

  const today = new Date();

  while (currentDate <= today) {
    const key = formatDate(currentDate);

    if (streakStorage[key]) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 0;
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return maxStreak;
}

