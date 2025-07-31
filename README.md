# Tadhkir

[![wakatime](https://wakatime.com/badge/github/Haaffiiizzz/Tadhkir.svg)](https://wakatime.com/badge/github/Haaffiiizzz/Tadhkir)

**Tadhkir** is a powerful Prayer Reminder & Tracker designed to help you maintain your daily prayer routine with ease. Enjoy timely notifications delivered just minutes before each prayer, ensuring you never miss your Salah. With precise, location-based prayer times and an intuitive, modern interface, Tadhkir not only tracks your progress but also inspires consistency along your spiritual journey.

---

## ✨ Features

### 1. Location-Based Prayer Times 📍
Once users accept location access, Tadhkir retrieves and stores accurate prayer data on their device. Users can view this data as prayers and their times for each day in the current month.

When a new month starts, the app dynamically fetches prayer times for the new month and stores them, giving users access to two months of data, and continuing in this manner.

There are **two major pages** to view this data:

- **Homepage:**  
  Displays the user's name, location information, and prayer timings for the current day.

- **Monthly Overview Page:**  
  Shows a grid of days in each saved month. Users can check prayer timings for any of those days.  
  - Clicking any day (excluding the current day) takes the user to a page that looks similar to the Homepage but displays only that day's data without unnecessary extra information.  
  - If the selected day is the current day, the app navigates to the Homepage.

There is also a **Settings page**, which will be discussed later.

---

### 2. Prayer Completion Tracking ✅
Users can mark any prayer from any day as done simply by clicking on it. This changes its color to green.

Since there are 5 daily prayers, the Monthly Overview Page displays each day's status with a color gradient ranging from red to green, with about 5 divisions in between to indicate progress:

- **Red:** Only one prayer completed.
- **Yellowish:** Around 4 prayers completed.
- **Green:** All 5 prayers completed.

---

### 3. Notifications 🔔
The app includes a notification feature:

- There will always be **5 days’ worth of notifications** for upcoming prayer times, including the current day.
- This holds as long as users open the app at least once every 5 days.
- If users do not open the app within that timeframe, notifications stop (as there are currently no push notifications or background tasking implemented).

---

### 4. Streak Feature 🔥
Tadhkir features a streak tracker that accurately displays the **current streak**, i.e., the number of consecutive days where all 5 prayers were marked complete.

> **Note:**  
> There are some issues calculating the **max streak** due to concerns about efficiency, which will be addressed later.

---
