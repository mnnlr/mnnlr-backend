// Function to check if the user logged out early based on current time
export const checkEarlyLogout = (performance) => {
  const timeTracking = performance?.timeTracking || [];
  if (timeTracking.length === 0) {
    return { isMorningEarlyLogout: false, isAfternoonEarlyLogout: false };
  }

  // Get the last logout time (latest entry)
  const lastLogout = timeTracking[timeTracking.length - 1]?.timeOut;
  if (!lastLogout) {
    return { isMorningEarlyLogout: false, isAfternoonEarlyLogout: false };
  }

  const [logoutHours, logoutMinutes] = lastLogout.split(":").map(Number);

  // Get the first login time
  const firstLogin = timeTracking[0]?.timeIn;
  if (!firstLogin) {
    return { isMorningEarlyLogout: false, isAfternoonEarlyLogout: false };
  }

  const [loginHours] = firstLogin.split(":").map(Number);

  // Get the current time
  const currentTime = new Date();
  const currentHour = currentTime.getHours();

  let isMorningEarlyLogout = false;
  let isAfternoonEarlyLogout = false;

  // Morning Early Logout: Only check at 6 AM
  if (currentHour === 6) {
    const isMorningLogin = loginHours >= 8 && loginHours < 14; // 9 AM to before 2 PM
    if (isMorningLogin) {
      isMorningEarlyLogout =
        logoutHours < 6 || (logoutHours === 6 && logoutMinutes === 0);
    }
  }

  // Afternoon Early Logout: Only check at 11 AM
  if (currentHour === 11) {
    const isAfternoonLogin = loginHours >= 14 && loginHours < 23; // 3 PM to before 11 PM
    if (isAfternoonLogin) {
      isAfternoonEarlyLogout =
        logoutHours < 11 || (logoutHours === 11 && logoutMinutes === 0);
    }
  }

  return { isMorningEarlyLogout, isAfternoonEarlyLogout };
};
