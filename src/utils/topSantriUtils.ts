import { Transaction, Student, TopSantriStat } from '../types';

export type TopSantriPeriod = 'realtime' | '7days' | '30days' | 'all';
export type TopSantriSortBy = 'amount' | 'frequency';

export interface EnrichedTopSantri extends TopSantriStat {
  rank: number;
  average_spent_per_trx: number;
  percentage_of_total: number;
  last_trx_time?: string;
  favorite_category?: string;
}

export interface TopSantriCalculationResult {
  list: EnrichedTopSantri[];
  totalPeriodSpent: number;
  totalPeriodTrxs: number;
  totalActiveSantri: number;
  periodLabel: string;
}

/**
 * Filter transactions according to selected time period:
 * - realtime: Hari ini sejak 00:00:00 (live realtime seiring bertambahnya transaksi)
 * - 7days: 7 hari terakhir
 * - 30days: 1 bulan (30 hari terakhir)
 * - all: Sepanjang waktu
 */
export function filterTransactionsByPeriod(
  transactions: Transaction[] = [],
  period: TopSantriPeriod
): Transaction[] {
  const now = new Date();

  if (period === 'realtime') {
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).getTime();
    return (transactions || []).filter((t) => {
      const time = new Date(t.created_at).getTime();
      return !isNaN(time) && time >= startOfToday;
    });
  }

  if (period === '7days') {
    const startOf7DaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7, 0, 0, 0, 0).getTime();
    return (transactions || []).filter((t) => {
      const time = new Date(t.created_at).getTime();
      return !isNaN(time) && time >= startOf7DaysAgo;
    });
  }

  if (period === '30days') {
    const startOf30DaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30, 0, 0, 0, 0).getTime();
    return (transactions || []).filter((t) => {
      const time = new Date(t.created_at).getTime();
      return !isNaN(time) && time >= startOf30DaysAgo;
    });
  }

  return transactions || [];
}

export function getPeriodLabel(period: TopSantriPeriod): string {
  switch (period) {
    case 'realtime':
      return 'Realtime (Hari Ini)';
    case '7days':
      return '7 Hari Terakhir';
    case '30days':
      return '1 Bulan Terakhir';
    case 'all':
      return 'Semua Waktu';
    default:
      return 'Semua Waktu';
  }
}

/**
 * Computes top santri aggregated metrics based on transactions and students.
 */
export function computeTopSantriList(
  transactions: Transaction[] = [],
  students: Student[] = [],
  period: TopSantriPeriod = 'realtime',
  sortBy: TopSantriSortBy = 'amount'
): TopSantriCalculationResult {
  const periodTrxs = filterTransactionsByPeriod(transactions, period);

  const studentMap = new Map<
    string,
    {
      total_spent: number;
      count: number;
      categoryCounts: Record<string, number>;
      last_trx_time: string;
      student_name_fallback: string;
    }
  >();

  let totalPeriodSpent = 0;

  for (const t of periodTrxs) {
    if (!t.student_id) continue;
    const amount = Number(t.amount) || 0;
    totalPeriodSpent += amount;

    const prev = studentMap.get(t.student_id) || {
      total_spent: 0,
      count: 0,
      categoryCounts: {},
      last_trx_time: '',
      student_name_fallback: t.student_name || 'Santri',
    };

    prev.total_spent += amount;
    prev.count += 1;

    if (t.category) {
      prev.categoryCounts[t.category] = (prev.categoryCounts[t.category] || 0) + 1;
    }

    if (!prev.last_trx_time || new Date(t.created_at).getTime() > new Date(prev.last_trx_time).getTime()) {
      prev.last_trx_time = t.created_at;
    }

    studentMap.set(t.student_id, prev);
  }

  const studentsLookup = new Map<string, Student>();
  for (const s of students || []) {
    studentsLookup.set(s.id, s);
  }

  const rawList = Array.from(studentMap.entries()).map(([studentId, data]) => {
    const student = studentsLookup.get(studentId);

    // Kategori favorit
    let topCat = '-';
    let maxCatCount = 0;
    for (const [cat, cnt] of Object.entries(data.categoryCounts)) {
      if (cnt > maxCatCount) {
        maxCatCount = cnt;
        topCat = cat;
      }
    }

    const total_spent = data.total_spent;
    const transaction_count = data.count;

    return {
      student_id: studentId,
      student_name: student?.name || data.student_name_fallback,
      nis: student?.nis || '-',
      class_name: student?.class_name || '-',
      dormitory: student?.dormitory || '-',
      avatar_url: student?.avatar_url,
      total_spent,
      transaction_count,
      current_balance: student?.balance || 0,
      average_spent_per_trx: transaction_count > 0 ? Math.round(total_spent / transaction_count) : 0,
      percentage_of_total: totalPeriodSpent > 0 ? (total_spent / totalPeriodSpent) * 100 : 0,
      last_trx_time: data.last_trx_time,
      favorite_category: topCat,
      rank: 0,
    };
  });

  // Sort
  rawList.sort((a, b) => {
    if (sortBy === 'amount') {
      return b.total_spent - a.total_spent || b.transaction_count - a.transaction_count;
    } else {
      return b.transaction_count - a.transaction_count || b.total_spent - a.total_spent;
    }
  });

  // Assign ranks
  const rankedList: EnrichedTopSantri[] = rawList.map((item, idx) => ({
    ...item,
    rank: idx + 1,
  }));

  return {
    list: rankedList,
    totalPeriodSpent,
    totalPeriodTrxs: periodTrxs.length,
    totalActiveSantri: rankedList.length,
    periodLabel: getPeriodLabel(period),
  };
}
