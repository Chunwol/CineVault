import instance from './instance';

export const POSTER_BASE_URL   = 'https://image.tmdb.org/t/p/w500';
export const BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/w1280';
export const PROFILE_BASE_URL  = 'https://image.tmdb.org/t/p/w185';
export const PROVIDER_BASE_URL = 'https://image.tmdb.org/t/p/w45';

const QUARTER_DATE_RANGES = {
  1: { gte: '-01-01', lte: '-03-31' },
  2: { gte: '-04-01', lte: '-06-30' },
  3: { gte: '-07-01', lte: '-09-30' },
  4: { gte: '-10-01', lte: '-12-31' },
};

// 모든 함수가 { results, totalPages } 형태로 반환 — Home에서 페이지네이션 처리용
const parseResponse = (data) => ({
  results: data.results ?? [],
  totalPages: data.total_pages ?? 1,
});

// region=KR 활성 시 discover로 극장 개봉작만 — with_release_type: '2|3'이 핵심
// /movie/popular, /movie/top_rated는 region만으로는 전 세계 기준 그대로라 미개봉작 포함됨
const fetchDiscoverKorean = async (extraParams, page) => {
  const { data } = await instance.get('/discover/movie', {
    params: { ...extraParams, region: 'KR', with_release_type: '2|3', page },
  });
  return parseResponse(data);
};

// /movie/now_playing, /movie/upcoming은 release_type 2|3 기반 엔드포인트라 region=KR로 충분
export const fetchNowPlayingMovies = async (page = 1, region = undefined) => {
  const { data } = await instance.get('/movie/now_playing', { params: { page, region } });
  return parseResponse(data);
};

export const fetchUpcomingMovies = async (page = 1, region = undefined) => {
  const { data } = await instance.get('/movie/upcoming', { params: { page, region } });
  return parseResponse(data);
};

export const fetchPopularMovies = async (page = 1, region = undefined) => {
  if (region) return fetchDiscoverKorean({ sort_by: 'popularity.desc' }, page);
  const { data } = await instance.get('/movie/popular', { params: { page } });
  return parseResponse(data);
};

export const fetchTopRatedMovies = async (page = 1, region = undefined) => {
  if (region) return fetchDiscoverKorean({ sort_by: 'vote_average.desc', 'vote_count.gte': 200 }, page);
  const { data } = await instance.get('/movie/top_rated', { params: { page } });
  return parseResponse(data);
};

export const fetchMoviesByGenre = async (genreId, page = 1, region = undefined) => {
  const params = { with_genres: genreId, sort_by: 'popularity.desc', page };
  if (region) {
    params.region = region;
    params.with_release_type = '2|3';
  }
  const { data } = await instance.get('/discover/movie', { params });
  return parseResponse(data);
};

// 필터 파라미터를 그대로 전달하는 범용 discover 함수
export const fetchDiscoverFiltered = async (params) => {
  const { data } = await instance.get('/discover/movie', { params });
  return parseResponse(data);
};

export const fetchMovieDetails = async (id) => {
  const { data } = await instance.get(`/movie/${id}`, {
    params: { append_to_response: 'credits,videos,reviews,watch/providers,release_dates' },
  });
  return data;
};

export const searchMovies = async (query, page = 1) => {
  const { data } = await instance.get('/search/movie', { params: { query, page } });
  return parseResponse(data);
};

export const fetchMoviesByYearAndQuarter = async (year, quarter = null, page = 1, region = undefined) => {
  const params = { sort_by: 'popularity.desc', page };
  if (region) {
    params.region = region;
    params.with_release_type = '2|3';
  }
  if (quarter) {
    const range = QUARTER_DATE_RANGES[quarter];
    params['primary_release_date.gte'] = `${year}${range.gte}`;
    params['primary_release_date.lte'] = `${year}${range.lte}`;
  } else {
    params.primary_release_year = year;
  }
  const { data } = await instance.get('/discover/movie', { params });
  return parseResponse(data);
};
