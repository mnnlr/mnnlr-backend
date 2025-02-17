// Function to check if the login time is late
export const checkLateLogin = (performance) => {
  const timeIn = performance?.timeTracking?.[0]?.timeIn;
  if (!timeIn) return { isMorningLate: false, isAfternoonLate: false }; // Skip users without login time

  const [hours, minutes] = timeIn.split(":").map(Number);

  // Separate variables for morning and afternoon late login
  const isMorningLate =
    (hours > 9 && hours < 13) || (hours === 9 && minutes > 15);
  const isAfternoonLate =
    (hours > 15 && hours < 21) || (hours === 15 && minutes > 15);

  return { isMorningLate, isAfternoonLate };
};
