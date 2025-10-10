/**
 * Utility functions for time formatting and handling
 */

export const formatTime = (hour: number, minute: number, isMilitaryTime: boolean): string => {
  if (isMilitaryTime) {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  } else {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
  }
};

export const formatTimeFromDate = (date: Date, isMilitaryTime: boolean): string => {
  return formatTime(date.getHours(), date.getMinutes(), isMilitaryTime);
};

export const convertTo24Hour = (hour: number, minute: number, isPM: boolean): { hour: number; minute: number } => {
  let convertedHour = hour;
  if (isPM && hour !== 12) {
    convertedHour += 12;
  } else if (!isPM && hour === 12) {
    convertedHour = 0;
  }
  return { hour: convertedHour, minute };
};

export const convertFrom24Hour = (hour: number, minute: number): { hour: number; minute: number; isPM: boolean } => {
  const isPM = hour >= 12;
  let convertedHour = hour;
  if (hour === 0) {
    convertedHour = 12;
  } else if (hour > 12) {
    convertedHour = hour - 12;
  }
  return { hour: convertedHour, minute, isPM };
};

export const createTimeFromHourMinute = (hour: number, minute: number): Date => {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date;
};