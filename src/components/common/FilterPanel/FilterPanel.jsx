import { GENRES } from '@/constants/genres';

import styles from './FilterPanel.module.css';

export const DEFAULT_FILTERS = {
  sortBy:    'popularity.desc',
  genreIds:  [],
  minRating: 0,
  yearFrom:  null,
  yearTo:    null,
};

const SORT_OPTIONS = [
  { label: '인기순',    value: 'popularity.desc' },
  { label: '평점순',    value: 'vote_average.desc' },
  { label: '최신순',    value: 'primary_release_date.desc' },
  { label: '오래된순',  value: 'primary_release_date.asc' },
];

const RATING_OPTIONS = [
  { label: '전체',  value: 0 },
  { label: '5점+', value: 5 },
  { label: '6점+', value: 6 },
  { label: '7점+', value: 7 },
  { label: '8점+', value: 8 },
  { label: '9점+', value: 9 },
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 1989 }, (_, i) => CURRENT_YEAR - i);

export function countActiveFilters(filters) {
  let count = 0;
  if (filters.sortBy    !== DEFAULT_FILTERS.sortBy)    count++;
  if (filters.genreIds.length > 0)                     count++;
  if (filters.minRating !== DEFAULT_FILTERS.minRating) count++;
  if (filters.yearFrom  || filters.yearTo)             count++;
  return count;
}

// hideYear: PAST 탭은 자체 연도/분기 컨트롤을 쓰므로 연도 섹션을 숨긴다
function FilterPanel({ filters, onChange, onReset, hideYear = false }) {
  const toggleGenre = (id) => {
    const next = filters.genreIds.includes(id)
      ? filters.genreIds.filter((gid) => gid !== id)
      : [...filters.genreIds, id];
    onChange({ ...filters, genreIds: next });
  };

  const activeCount = countActiveFilters(filters);

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <span className={styles.panelTitle}>
          필터
          {activeCount > 0 && <span className={styles.activeCount}>{activeCount}</span>}
        </span>
        <button className={styles.resetBtn} onClick={onReset}>
          초기화
        </button>
      </div>

      <div className={styles.body}>
        <div className={styles.section}>
          <p className={styles.sectionLabel}>정렬</p>
          <div className={styles.chips}>
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                className={`${styles.chip} ${filters.sortBy === opt.value ? styles.chipActive : ''}`}
                onClick={() => onChange({ ...filters, sortBy: opt.value })}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <p className={styles.sectionLabel}>
            장르
            <span className={styles.sectionSub}>복수 선택 가능</span>
            {filters.genreIds.length > 0 && (
              <button
                className={styles.clearSmall}
                onClick={() => onChange({ ...filters, genreIds: [] })}
              >
                전체 해제
              </button>
            )}
          </p>
          <div className={styles.chips}>
            {GENRES.map((g) => (
              <button
                key={g.id}
                className={`${styles.chip} ${filters.genreIds.includes(g.id) ? styles.chipActive : ''}`}
                onClick={() => toggleGenre(g.id)}
              >
                {g.name}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <p className={styles.sectionLabel}>최소 평점</p>
          <div className={styles.chips}>
            {RATING_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                className={`${styles.chip} ${filters.minRating === opt.value ? styles.chipActive : ''}`}
                onClick={() => onChange({ ...filters, minRating: opt.value })}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {!hideYear && (
          <div className={styles.section}>
            <p className={styles.sectionLabel}>개봉 연도</p>
            <div className={styles.yearRow}>
              <select
                className={styles.yearSelect}
                value={filters.yearFrom ?? ''}
                onChange={(e) => onChange({ ...filters, yearFrom: e.target.value ? Number(e.target.value) : null })}
              >
                <option value="">전체</option>
                {YEARS.map((y) => <option key={y} value={y}>{y}년</option>)}
              </select>
              <span className={styles.yearSep}>~</span>
              <select
                className={styles.yearSelect}
                value={filters.yearTo ?? ''}
                onChange={(e) => onChange({ ...filters, yearTo: e.target.value ? Number(e.target.value) : null })}
              >
                <option value="">전체</option>
                {YEARS.map((y) => <option key={y} value={y}>{y}년</option>)}
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FilterPanel;
