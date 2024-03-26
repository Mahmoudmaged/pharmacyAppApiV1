export const isExpired = (date) => {
  return date.setDate(date.getDate() + 1) < Date.now() ? true : false;
};
