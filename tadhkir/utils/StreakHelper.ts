import AsyncStorage from "@react-native-async-storage/async-storage";
import { convertDateObjectToString, convertDateStringToDateObject } from "./Helper";

export async function calculateCurrentStreak(streakStorage: Record<string, boolean>) {
  const today = new Date();
  const maxStreak = Number(await AsyncStorage.getItem("maxStreak"))

  let startDate = new Date(today);
  const todayKey = convertDateObjectToString(today);
  // If today is not marked true, start from yesterday
  if (!streakStorage[todayKey]) {
    startDate.setDate(startDate.getDate() - 1);
  }

  let streak = 0;
  for (let i = 0; ; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() - i);
    const key = convertDateObjectToString(date);

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
    const key = convertDateObjectToString(currentDate);

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


type StreakPoint = {
  label: string;
  value: number;
};

export function getWeeklyStreakData(streakStorage: Record<string, boolean>): StreakPoint[] {
  const allDates = Object.keys(streakStorage).map(convertDateStringToDateObject);
  if (allDates.length === 0) return [];

  // Sort all dates chronologically
  allDates.sort((a, b) => a.getTime() - b.getTime());

  const weeklyStreaks: StreakPoint[] = [];
  let currentWeekStart = getWeekStart(allDates[0]);
  let currentWeekEnd = new Date(currentWeekStart);
  currentWeekEnd.setDate(currentWeekStart.getDate() + 13);

  let streak = 0;
  let maxStreak = 0;

  for (let i = 0; i <= allDates.length; i++) {
    const date = allDates[i];
    const key = date ? convertDateObjectToString(date) : null;

    if (!date || date > currentWeekEnd) {
      const label = formatWeekLabel(currentWeekStart, currentWeekEnd);
      weeklyStreaks.push({ label, value: maxStreak });

      // Move to next week
      currentWeekStart.setDate(currentWeekStart.getDate() + 14);  // move by 2 weeks
      currentWeekEnd = new Date(currentWeekStart);
      currentWeekEnd.setDate(currentWeekStart.getDate() + 13);

      streak = 0;
      maxStreak = 0;

      if (!date) break; // reached the end
      i--; // reprocess current date in new week
      continue;
    }

    if (streakStorage[key!]) {
      streak++;
      maxStreak = Math.max(maxStreak, streak);
    } else {
      streak = 0;
    }
  }

  return weeklyStreaks;
}

// Gets the Sunday of the week
function getWeekStart(date: Date): Date {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() - newDate.getDay()); // Sunday as start
  newDate.setHours(0, 0, 0, 0);
  return newDate;
}

function formatWeekLabel(start: Date, end: Date): string {
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return `${start.toLocaleDateString('en-US', options)}–${end.toLocaleDateString('en-US', options)}`;
}


