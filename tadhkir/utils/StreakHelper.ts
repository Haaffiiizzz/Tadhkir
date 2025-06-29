import AsyncStorage from "@react-native-async-storage/async-storage";

export async function calculateCurrentStreak(streakStorage: Record<string, boolean>) {
  const today = new Date();
  const maxStreak = Number(await AsyncStorage.getItem("maxStreak"))

  const formatDate = (date: Date) => {
    /**
     * 
     * Function to convert date object to dd-mm-yyyy format
    */
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };

  let startDate = new Date(today);
  const todayKey = formatDate(today);
  console.log(streakStorage)
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

  if (streak > maxStreak){
    await AsyncStorage.setItem("maxStreak", String(streak))
  }
  return streak;
}
