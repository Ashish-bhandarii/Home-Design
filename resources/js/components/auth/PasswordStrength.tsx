import { useMemo } from 'react';

function scorePassword(pw: string) {
  let score = 0;
  if (!pw) return 0;
  const length = Math.min(pw.length, 20);
  score += length * 5; // up to 100
  const variety = [/[a-z]/, /[A-Z]/, /\d/, /[^\w]/].reduce((acc, r) => acc + (r.test(pw) ? 1 : 0), 0);
  score += (variety - 1) * 10; // +0..30
  return Math.min(130, score);
}

function labelFromScore(score: number) {
  if (score >= 100) return { label: 'Strong', color: 'bg-green-500' };
  if (score >= 70) return { label: 'Good', color: 'bg-yellow-500' };
  if (score >= 40) return { label: 'Weak', color: 'bg-orange-500' };
  return { label: 'Very Weak', color: 'bg-red-500' };
}

export default function PasswordStrength({ value }: { value: string }) {
  const { pct, label, color } = useMemo(() => {
    const s = scorePassword(value);
    const pct = Math.min(100, Math.round((s / 100) * 100));
    const { label, color } = labelFromScore(s);
    return { pct, label, color };
  }, [value]);

  if (!value) return null;

  return (
    <div className="mt-1.5">
      <div className="h-1.5 w-full rounded-full bg-muted">
        <div
          className={`h-1.5 rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-1 text-[11px] text-muted-foreground">{label}</div>
    </div>
  );
}
