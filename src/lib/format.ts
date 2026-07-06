// "2026-05-11" -> "5/11"
export function shortWeekLabel(isoDate: string): string {
  const [, month, day] = isoDate.split('-');
  return `${Number(month)}/${Number(day)}`;
}

export function weeksOutLabel(weeksOut: number): string {
  return `${weeksOut} ${weeksOut === 1 ? 'week' : 'weeks'} out`;
}
