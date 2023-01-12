import { addMonths, isAfter, parseISO } from 'date-fns';

export const verifyIfIsNewJoiner = (joinedAt: string, providerAccountCreatedAt?: string) => {
  const dateToCompare = parseISO(providerAccountCreatedAt || joinedAt);

  const maxDateToBeNewJoiner = addMonths(dateToCompare, 3);

  return isAfter(maxDateToBeNewJoiner, new Date());
};
