export function calculateCurrentStreak (streakStorage){
    
    const today = new Date();
    let streak = 0;

    for (let i = 0; ; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        const dd = String(date.getDate()).padStart(2, '0');
        const mm = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
        const yyyy = date.getFullYear();

        const key = `${dd}-${mm}-${yyyy}`; // Format: 'dd-mm-yyyy'

        if (streakStorage[key]) {
        streak++;
        } else {
        break;
        }
    }

    return streak;
}