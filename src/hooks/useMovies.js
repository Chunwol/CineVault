import { useReducer, useEffect } from 'react';

import {
  fetchNowPlayingMovies,
  fetchPopularMovies,
  fetchTopRatedMovies,
  fetchUpcomingMovies,
  fetchMoviesByGenre,
  fetchMoviesByYearAndQuarter,
  fetchDiscoverFiltered,
  searchMovies,
} from '@/apis/tmdb';
import { DEFAULT_FILTERS } from '@/components/common/FilterPanel/FilterPanel';

const VIEW_MODE = {
  NOW_PLAYING: 'nowPlaying',
  POPULAR:     'popular',
  UPCOMING:    'upcoming',
  TOP_RATED:   'topRated',
  GENRE:       'genre',
  PAST:        'past',
};

const KR_REGION = 'KR';

const QUARTER_DATE_RANGES = {
  1: { gte: '-01-01', lte: '-03-31' },
  2: { gte: '-04-01', lte: '-06-30' },
  3: { gte: '-07-01', lte: '-09-30' },
  4: { gte: '-10-01', lte: '-12-31' },
};

const daysOffset = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

// 필터가 기본값에서 변경되었는지 확인
function isFiltersActive(filters) {
  return filters.sortBy !== DEFAULT_FILTERS.sortBy
    || filters.genreIds.length > 0
    || filters.minRating > 0
    || !!filters.yearFrom
    || !!filters.yearTo;
}

// 검색 결과에 클라이언트 사이드 필터 적용
function applyClientFilters(movies, filters) {
  if (!isFiltersActive(filters)) return movies;
  return movies.filter((movie) => {
    if (filters.genreIds.length > 0) {
      const ids = movie.genre_ids ?? movie.genres?.map((g) => g.id) ?? [];
      if (!filters.genreIds.some((id) => ids.includes(id))) return false;
    }
    if (filters.minRating > 0 && (movie.vote_average ?? 0) < filters.minRating) return false;
    const year = movie.release_date ? Number(movie.release_date.slice(0, 4)) : null;
    if (filters.yearFrom && year && year < filters.yearFrom) return false;
    if (filters.yearTo   && year && year > filters.yearTo)   return false;
    return true;
  });
}

// 탭 모드 discover 파라미터 생성
function buildDiscoverParams({ viewMode, filters, selectedGenreId, selectedYear, selectedQuarter, region, page }) {
  // 탭별 기본 정렬
  const tabDefaultSort = {
    [VIEW_MODE.NOW_PLAYING]: 'popularity.desc',
    [VIEW_MODE.POPULAR]:     'popularity.desc',
    [VIEW_MODE.UPCOMING]:    'primary_release_date.asc',
    [VIEW_MODE.TOP_RATED]:   'vote_average.desc',
    [VIEW_MODE.GENRE]:       'popularity.desc',
    [VIEW_MODE.PAST]:        'popularity.desc',
  };
  const sortBy = filters.sortBy !== DEFAULT_FILTERS.sortBy
    ? filters.sortBy
    : (tabDefaultSort[viewMode] ?? 'popularity.desc');

  const params = { sort_by: sortBy, page };

  // 장르
  const genreIds = [
    ...(viewMode === VIEW_MODE.GENRE && selectedGenreId ? [selectedGenreId] : []),
    ...(filters.genreIds ?? []),
  ];
  if (genreIds.length > 0) params.with_genres = genreIds.join(',');

  // 평점
  if (filters.minRating > 0)          params['vote_average.gte'] = filters.minRating;
  if (viewMode === VIEW_MODE.TOP_RATED) params['vote_count.gte'] = 200;

  // 날짜 범위 (탭별)
  if (viewMode === VIEW_MODE.NOW_PLAYING) {
    params['primary_release_date.gte'] = filters.yearFrom ? `${filters.yearFrom}-01-01` : daysOffset(-60);
    params['primary_release_date.lte'] = filters.yearTo   ? `${filters.yearTo}-12-31`   : daysOffset(14);
  } else if (viewMode === VIEW_MODE.UPCOMING) {
    params['primary_release_date.gte'] = filters.yearFrom ? `${filters.yearFrom}-01-01` : daysOffset(1);
    params['primary_release_date.lte'] = filters.yearTo   ? `${filters.yearTo}-12-31`   : daysOffset(180);
  } else if (viewMode === VIEW_MODE.PAST) {
    // PAST 탭은 자체 연도/분기 컨트롤 사용 (yearFrom/To 무시)
    if (selectedQuarter) {
      const range = QUARTER_DATE_RANGES[selectedQuarter];
      params['primary_release_date.gte'] = `${selectedYear}${range.gte}`;
      params['primary_release_date.lte'] = `${selectedYear}${range.lte}`;
    } else {
      params.primary_release_year = selectedYear;
    }
  } else {
    if (filters.yearFrom) params['primary_release_date.gte'] = `${filters.yearFrom}-01-01`;
    if (filters.yearTo)   params['primary_release_date.lte'] = `${filters.yearTo}-12-31`;
  }

  // 한국 필터
  if (region) {
    params.region = region;
    params.with_release_type = '2|3';
  }

  return params;
}

const initialState = {
  movies: [], hasMore: false,
  isLoading: true, isLoadingMore: false, error: null,
};

function moviesReducer(state, action) {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, isLoading: true, isLoadingMore: false, error: null };
    case 'FETCH_MORE_START':
      return { ...state, isLoadingMore: true, error: null };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        movies: action.page === 1 ? action.results : [...state.movies, ...action.results],
        hasMore: action.page < action.totalPages,
        isLoading: false, isLoadingMore: false,
      };
    case 'FETCH_ERROR':
      return { ...state, isLoading: false, isLoadingMore: false, error: action.message };
    default: return state;
  }
}

// 영화 목록 페칭 + 페이지네이션. searchTerm은 제출된 검색어(Enter/버튼)만 들어오고,
// selectedGenreId는 장르 탐색 탭에서만 쓰인다.
function useMovies({
  viewMode, selectedGenreId, filters,
  selectedYear, selectedQuarter,
  isKoreanOnly, searchTerm, page,
}) {
  const [state, dispatch] = useReducer(moviesReducer, initialState);

  const filtersKey = `${filters.sortBy}|${filters.genreIds.join(',')}|${filters.minRating}|${filters.yearFrom}|${filters.yearTo}`;

  useEffect(() => {
    dispatch({ type: page === 1 ? 'FETCH_START' : 'FETCH_MORE_START' });

    const region  = isKoreanOnly ? KR_REGION : undefined;
    const filtersOn = isFiltersActive(filters);

    const fetchMovies = async () => {
      try {
        let results, totalPages;

        if (searchTerm) {
          // 검색 모드: /search/movie → 클라이언트 필터
          ({ results, totalPages } = await searchMovies(searchTerm, page));
          results = applyClientFilters(results, filters);
        } else if (filtersOn) {
          // 필터 활성: discover API (모든 탭 공통)
          const params = buildDiscoverParams({
            viewMode, filters, selectedGenreId,
            selectedYear, selectedQuarter, region, page,
          });
          ({ results, totalPages } = await fetchDiscoverFiltered(params));
        } else {
          // 필터 없음: 탭별 전용 엔드포인트
          switch (viewMode) {
            case VIEW_MODE.NOW_PLAYING: ({ results, totalPages } = await fetchNowPlayingMovies(page, region)); break;
            case VIEW_MODE.POPULAR:     ({ results, totalPages } = await fetchPopularMovies(page, region));    break;
            case VIEW_MODE.UPCOMING:    ({ results, totalPages } = await fetchUpcomingMovies(page, region));   break;
            case VIEW_MODE.TOP_RATED:   ({ results, totalPages } = await fetchTopRatedMovies(page, region));   break;
            case VIEW_MODE.GENRE:       ({ results, totalPages } = await fetchMoviesByGenre(selectedGenreId, page, region)); break;
            case VIEW_MODE.PAST:        ({ results, totalPages } = await fetchMoviesByYearAndQuarter(selectedYear, selectedQuarter, page, region)); break;
            default: results = []; totalPages = 1;
          }
        }

        dispatch({ type: 'FETCH_SUCCESS', results, totalPages, page });
      } catch (err) {
        console.error('[useMovies] 로드 실패:', err);
        dispatch({ type: 'FETCH_ERROR', message: '영화 정보를 불러오는데 실패했습니다.' });
      }
    };

    fetchMovies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode, selectedGenreId, filtersKey, selectedYear, selectedQuarter, isKoreanOnly, searchTerm, page]);

  return state;
}

export default useMovies;
