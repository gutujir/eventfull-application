import { useEffect, useMemo, useState } from "react";

interface CountdownProps {
  targetDate: string | Date;
  className?: string;
}

const pad = (n: number) => String(n).padStart(2, "0");

const getTimeParts = (ms: number) => {
  if (ms <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds };
};

export default function Countdown({
  targetDate,
  className = "",
}: CountdownProps) {
  const target =
    typeof targetDate === "string" ? new Date(targetDate) : targetDate;
  const targetTime = useMemo(() => target.getTime(), [targetDate]);

  const [remaining, setRemaining] = useState(() =>
    Math.max(targetTime - Date.now(), 0),
  );

  useEffect(() => {
    const id = setInterval(() => {
      setRemaining(() => Math.max(targetTime - Date.now(), 0));
    }, 1000);
    return () => clearInterval(id);
  }, [targetTime]);

  const { days, hours, minutes, seconds } = getTimeParts(remaining);

  if (remaining <= 0) {
    return (
      <span className={`text-sm text-green-600 font-medium ${className}`}>
        Started
      </span>
    );
  }

  return (
    <div className={`text-sm text-gray-700 font-medium ${className}`}>
      <span className="mr-2">{days}d</span>
      <span className="mr-2">{pad(hours)}h</span>
      <span className="mr-2">{pad(minutes)}m</span>
      <span>{pad(seconds)}s</span>
    </div>
  );
}
