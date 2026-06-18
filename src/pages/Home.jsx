import { useState } from 'react';

import useMovies from '@/hooks/useMovies';
import MovieCard from '@/components/common/MovieCard';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import FilterPanel, { DEFAULT_FILTERS, countActiveFilters } from '@/components/common/FilterPanel/FilterPanel';
import { GENRES } from '@/constants/genres';

import styles from './Home.module.css';

const CURRENT_YEAR = new Date().getFullYear();

const VIEW_MODE = {
  NOW_PLAYING: 'nowPlaying',
  POPULAR:     'popular',
  UPCOMING:    'upcoming',
  TOP_RATED:   'topRated',
  GENRE:       'genre',
  PAST:        'past',
};

// PAST 탭은 자체 날짜 컨트롤이 있으므로 FilterPanel의 연도 섹션 숨김
const HIDE_YEAR_TABS = new Set([VIEW_MODE.PAST]);

const TABS = [
  { label: '현재 상영작',    mode: VIEW_MODE.NOW_PLAYING },
  { label: '🏆 박스오피스', mode: VIEW_MODE.POPULAR },
  { label: '🎬 개봉 예정',  mode: VIEW_MODE.UPCOMING },
  { label: '⭐ 명작 컬렉션', mode: VIEW_MODE.TOP_RATED },
  { label: '🎭 장르 탐색',  mode: VIEW_MODE.GENRE },
  { label: '📅 이전 상영작', mode: VIEW_MODE.PAST },
];

const PAST_YEARS = Array.from({ length: CURRENT_YEAR - 1999 }, (_, i) => CURRENT_YEAR - 1 - i);

const QUARTERS = [
  { label: '전체', value: null }, { label: '1분기', value: 1 },
  { label: '2분기', value: 2 },  { label: '3분기', value: 3 },
  { label: '4분기', value: 4 },
];

function Home() {
  // 검색: 입력값 / 제출값 분리 (Enter 또는 버튼 클릭에만 API 호출)
  const [searchInput, setSearchInput]   = useState('');
  const [searchTerm, setSearchTerm]     = useState('');

  const [viewMode, setViewMode]         = useState(VIEW_MODE.NOW_PLAYING);
  const [selectedGenreId, setSelectedGenreId] = useState(GENRES[0].id);
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR - 1);
  const [selectedQuarter, setSelectedQuarter] = useState(null);
  const [isKoreanOnly, setIsKoreanOnly] = useState(true);
  const [page, setPage]                 = useState(1);

  const [filters, setFilters]           = useState(DEFAULT_FILTERS);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { movies, hasMore, isLoading, isLoadingMore, error } = useMovies({
    viewMode,
    selectedGenreId,
    filters,
    selectedYear,
    selectedQuarter,
    isKoreanOnly,
    searchTerm,
    page,
  });

  const handleSearchSubmit = () => {
    setSearchTerm(searchInput.trim());
    setPage(1);
  };
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') handleSearchSubmit();
  };
  const handleSearchClear = () => {
    setSearchInput('');
    setSearchTerm('');
    setPage(1);
  };

  const handleTabChange = (mode) => {
    setViewMode(mode);
    setSearchInput('');
    setSearchTerm('');
    setFilters(DEFAULT_FILTERS);
    setIsFilterOpen(false);
    setPage(1);
  };

  const handleGenreSelect   = (id) => { setSelectedGenreId(id); setPage(1); };
  const handleYearChange    = (e) => { setSelectedYear(Number(e.target.value)); setSelectedQuarter(null); setPage(1); };
  const handleQuarterChange = (q)  => { setSelectedQuarter(q); setPage(1); };
  const handleKoreanToggle  = ()   => { setIsKoreanOnly((prev) => !prev); setPage(1); };
  const handleLoadMore      = ()   => setPage((prev) => prev + 1);

  const handleFilterChange  = (next) => { setFilters(next); setPage(1); };
  const handleFilterReset   = ()     => { setFilters(DEFAULT_FILTERS); setPage(1); };
  const toggleFilter        = ()     => setIsFilterOpen((prev) => !prev);

  const getHeading = () => {
    if (searchTerm) return `"${searchTerm}" 검색 결과`;
    const genreName  = GENRES.find((g) => g.id === selectedGenreId)?.name;
    const filterGenreNames = filters.genreIds
      .map((id) => GENRES.find((g) => g.id === id)?.name)
      .filter(Boolean)
      .join('·');
    const base = {
      [VIEW_MODE.NOW_PLAYING]: '현재 상영작',
      [VIEW_MODE.POPULAR]:     '박스오피스 인기작',
      [VIEW_MODE.UPCOMING]:    '개봉 예정작',
      [VIEW_MODE.TOP_RATED]:   '역대 명작 컬렉션',
      [VIEW_MODE.GENRE]:       `${genreName} 영화`,
      [VIEW_MODE.PAST]:        selectedQuarter
        ? `${selectedYear}년 ${selectedQuarter}분기 상영작`
        : `${selectedYear}년 상영작`,
    }[viewMode] ?? '';
    return filterGenreNames ? `${base} · ${filterGenreNames}` : base;
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <p className={styles.error}>{error}</p>;

  const activeFilterCount = countActiveFilters(filters);
  const showFilter = !searchTerm;

  return (
    <main className={styles.container}>

      <div className={styles.searchHero}>
        <div className={styles.searchRow}>
          <div className={styles.searchWrapper}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="영화 제목을 검색하세요..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
            {searchInput && (
              <button className={styles.searchClear} onClick={handleSearchClear}>✕</button>
            )}
          </div>

          <button className={styles.searchBtn} onClick={handleSearchSubmit}>검색</button>

          <button
            className={`${styles.filterBtn} ${isFilterOpen ? styles.filterBtnOpen : ''} ${activeFilterCount > 0 ? styles.filterBtnActive : ''}`}
            onClick={toggleFilter}
          >
            <span>🎯 필터</span>
            {activeFilterCount > 0 && (
              <span className={styles.filterBadge}>{activeFilterCount}</span>
            )}
          </button>

          <button
            className={`${styles.regionToggle} ${isKoreanOnly ? styles.activeRegion : ''}`}
            onClick={handleKoreanToggle}
          >
            🇰🇷 한국 개봉작만
          </button>
        </div>

        {showFilter && isFilterOpen && (
          <div className={styles.filterPanelWrapper}>
            <FilterPanel
              filters={filters}
              onChange={handleFilterChange}
              onReset={handleFilterReset}
              hideYear={HIDE_YEAR_TABS.has(viewMode)}
            />
          </div>
        )}
      </div>

      {!searchTerm && (
        <div className={styles.tabsWrapper}>
          <div className={styles.tabs}>
            {TABS.map(({ label, mode }) => (
              <button
                key={mode}
                className={`${styles.tab} ${viewMode === mode ? styles.activeTab : ''}`}
                onClick={() => handleTabChange(mode)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {!searchTerm && viewMode === VIEW_MODE.GENRE && (
        <div className={styles.genreChips}>
          {GENRES.map(({ id, name }) => (
            <button
              key={id}
              className={`${styles.genreChip} ${selectedGenreId === id ? styles.activeChip : ''}`}
              onClick={() => handleGenreSelect(id)}
            >
              {name}
            </button>
          ))}
        </div>
      )}

      {!searchTerm && viewMode === VIEW_MODE.PAST && (
        <div className={styles.pastFilters}>
          <select className={styles.yearSelect} value={selectedYear} onChange={handleYearChange}>
            {PAST_YEARS.map((year) => (
              <option key={year} value={year}>{year}년</option>
            ))}
          </select>
          <div className={styles.quarterButtons}>
            {QUARTERS.map(({ label, value }) => (
              <button
                key={label}
                className={`${styles.quarterButton} ${selectedQuarter === value ? styles.activeQuarter : ''}`}
                onClick={() => handleQuarterChange(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      <h1 className={styles.heading}>{getHeading()}</h1>

      {movies.length === 0 ? (
        <p className={styles.empty}>결과가 없습니다.</p>
      ) : (
        <>
          <div className={styles.grid}>
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>

          {hasMore && (
            <div className={styles.loadMoreSection}>
              <button
                className={styles.loadMoreButton}
                onClick={handleLoadMore}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? '불러오는 중...' : '더 불러오기'}
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}

export default Home;
