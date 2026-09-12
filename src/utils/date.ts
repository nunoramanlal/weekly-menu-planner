export function formatDate(
  value: string
): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`));
}

export function getWeekLabel(
  weekStart: string
): string {
  const start = new Date(
    `${weekStart}T00:00:00`
  );

  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  const formatter = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
  });

  return `${formatter.format(start)} – ${formatter.format(end)}`;
}

export function getNextMonday(): string {
  const today = new Date();

  const day = today.getDay();

  const daysUntilMonday =
    day === 0 ? 1 : 8 - day;

  const monday = new Date(today);

  monday.setDate(
    today.getDate() + daysUntilMonday
  );

  return monday.toISOString().split('T')[0];
}