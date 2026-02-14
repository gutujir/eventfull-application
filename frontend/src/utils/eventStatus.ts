type EventLike = {
  date?: string | Date;
  endDateTime?: string | Date;
  endDate?: string | Date;
  end_date?: string | Date;
  status?: string;
};

const toTimestamp = (value?: string | Date): number | null => {
  if (!value) return null;
  const parsed = value instanceof Date ? value.getTime() : Date.parse(value);
  return Number.isNaN(parsed) ? null : parsed;
};

export const getEventEndTimestamp = (event?: EventLike): number | null => {
  if (!event) return null;

  const explicitEnd =
    toTimestamp(event.endDateTime) ??
    toTimestamp(event.endDate) ??
    toTimestamp(event.end_date);

  if (explicitEnd) return explicitEnd;
  return toTimestamp(event.date);
};

export const isEventEnded = (event?: EventLike, now = Date.now()): boolean => {
  if (!event) return false;

  const normalizedStatus = event.status?.toUpperCase();
  if (normalizedStatus === "COMPLETED" || normalizedStatus === "CANCELLED") {
    return true;
  }

  const endTimestamp = getEventEndTimestamp(event);
  if (!endTimestamp) return false;

  return now >= endTimestamp;
};
