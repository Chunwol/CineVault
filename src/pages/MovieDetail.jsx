import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import {
  fetchMovieDetails,
  POSTER_BASE_URL,
  BACKDROP_BASE_URL,
  PROFILE_BASE_URL,
  PROVIDER_BASE_URL,
} from '@/apis/tmdb';
import { addMovie, updateMovie } from '@/store/archiveSlice';
import { toggleWishlist }        from '@/store/wishlistSlice';
import ReviewModal   from '@/components/common/ReviewModal';
import LoadingSpinner from '@/components/common/LoadingSpinner';

import styles from './MovieDetail.module.css';

const CAST_COUNT   = 10;
const REVIEW_COUNT = 5;
const PLACEHOLDER_PROFILE = 'https://placehold.co/185x185/1a1a2e/a0a0a0?text=?';

// TMDB 관람등급 코드 → 한국식 라벨/색상
const CERT_MAP = {
  'ALL': { label: '전체 관람가', color: '#22c55e' },
  '12':  { label: '12세 이상',   color: '#3b82f6' },
  '15':  { label: '15세 이상',   color: '#f59e0b' },
  '18':  { label: '청소년 관람불가', color: '#ef4444' },
  'R':   { label: '청소년 관람불가', color: '#ef4444' },
};

const KR_CINEMAS = [
  { name: 'CGV',     url: (t) => `https://www.cgv.co.kr/movies/?searchText=${encodeURIComponent(t)}` },
  { name: '롯데시네마', url: (t) => `https://www.lottecinema.co.kr/NLCHS/Movie/MovieList?flag=MovieSearch&searchWord=${encodeURIComponent(t)}` },
  { name: '메가박스',  url: (t) => `https://www.megabox.co.kr/movie?searchText=${encodeURIComponent(t)}` },
];

const fmtMoney = (n) =>
  n > 0
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
    : null;

function MovieDetail() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const dispatch     = useDispatch();

  const archivedMovies = useSelector((s) => s.archive.movies);
  const isWishlisted   = useSelector((s) => s.wishlist.movies.some((m) => m.id === Number(id)));

  const [movie,      setMovie]      = useState(null);
  const [isLoading,  setIsLoading]  = useState(true);
  const [error,      setError]      = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTrailerIdx, setActiveTrailerIdx] = useState(0);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        setMovie(await fetchMovieDetails(id));
      } catch {
        setError('영화 정보를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [id]);

  const handleOpenModal  = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleSubmitReview = (reviewData) => {
    const isArchived = archivedMovies.some((m) => m.id === Number(id));
    dispatch(isArchived ? updateMovie(reviewData) : addMovie(reviewData));
  };

  const handleWishlistToggle = () => dispatch(toggleWishlist(movie));

  if (isLoading) return <LoadingSpinner />;
  if (error)     return <p className={styles.errorMessage}>{error}</p>;
  if (!movie)    return null;

  const archivedData      = archivedMovies.find((m) => m.id === Number(id));
  const isAlreadyArchived = Boolean(archivedData);

  const backdropUrl = movie.backdrop_path ? `${BACKDROP_BASE_URL}${movie.backdrop_path}` : null;
  const posterUrl   = movie.poster_path   ? `${POSTER_BASE_URL}${movie.poster_path}`     : null;

  const director = movie.credits?.crew?.find((p) => p.job === 'Director');
  const writers  = (movie.credits?.crew ?? [])
    .filter((p) => ['Screenplay', 'Writer', 'Story'].includes(p.job))
    .reduce((acc, w) => (acc.some((a) => a.id === w.id) ? acc : [...acc, w]), [])
    .slice(0, 3);

  const topCast = (movie.credits?.cast ?? []).slice(0, CAST_COUNT);

  const trailers = (movie.videos?.results ?? []).filter(
    (v) => v.site === 'YouTube' && v.type === 'Trailer',
  );
  const activeTrailer = trailers[activeTrailerIdx] ?? null;

  const krRelease = (movie.release_dates?.results ?? []).find((r) => r.iso_3166_1 === 'KR');
  const krCert    = krRelease?.release_dates?.[0]?.certification ?? '';
  const certInfo  = CERT_MAP[krCert] ?? null;
  const krReleaseDate = krRelease?.release_dates?.[0]?.release_date?.slice(0, 10);

  // TMDB watch/providers의 한국(KR) 항목 — 스트리밍/대여/구매로 분리 제공
  const watchKR   = movie['watch/providers']?.results?.KR ?? null;
  const streaming = watchKR?.flatrate ?? [];
  const buyList   = watchKR?.buy ?? [];
  const rentList  = watchKR?.rent ?? [];

  const budget  = fmtMoney(movie.budget);
  const revenue = fmtMoney(movie.revenue);

  const reviews = (movie.reviews?.results ?? []).slice(0, REVIEW_COUNT);

  const hasProviders = streaming.length > 0 || rentList.length > 0 || buyList.length > 0;

  return (
    <div className={styles.page}>
      <div
        className={styles.hero}
        style={backdropUrl ? { backgroundImage: `url(${backdropUrl})` } : {}}
      >
        <button className={styles.backButton} onClick={() => navigate(-1)}>← 뒤로</button>
      </div>

      <div className={styles.content}>
        <div className={styles.movieInfo}>
          {posterUrl && (
            <img src={posterUrl} alt={movie.title} className={styles.poster} />
          )}

          <div className={styles.details}>
            <div className={styles.titleRow}>
              <h1 className={styles.title}>{movie.title}</h1>
              {certInfo && (
                <span
                  className={styles.certBadge}
                  style={{ background: certInfo.color }}
                >
                  {certInfo.label}
                </span>
              )}
            </div>

            {movie.original_title !== movie.title && (
              <p className={styles.originalTitle}>{movie.original_title}</p>
            )}

            <div className={styles.meta}>
              {krReleaseDate && <span>🇰🇷 {krReleaseDate} 개봉</span>}
              {!krReleaseDate && movie.release_date && <span>📅 {movie.release_date}</span>}
              {movie.vote_average > 0 && (
                <span>⭐ {movie.vote_average.toFixed(1)} ({movie.vote_count?.toLocaleString()}명)</span>
              )}
              {movie.runtime > 0 && <span>🕐 {movie.runtime}분</span>}
              {movie.status && <span>{movie.status}</span>}
              {movie.original_language && (
                <span>🌐 {movie.original_language.toUpperCase()}</span>
              )}
            </div>

            <div className={styles.genres}>
              {(movie.genres ?? []).map((g) => (
                <span key={g.id} className={styles.genreTag}>{g.name}</span>
              ))}
            </div>

            {(director || writers.length > 0) && (
              <div className={styles.crewRow}>
                {director && (
                  <span className={styles.crewItem}>
                    <span className={styles.crewLabel}>감독</span>
                    {director.name}
                  </span>
                )}
                {writers.length > 0 && (
                  <span className={styles.crewItem}>
                    <span className={styles.crewLabel}>각본</span>
                    {writers.map((w) => w.name).join(' · ')}
                  </span>
                )}
              </div>
            )}

            {(budget || revenue) && (
              <div className={styles.financeRow}>
                {budget  && <span><span className={styles.crewLabel}>제작비</span>{budget}</span>}
                {revenue && <span><span className={styles.crewLabel}>수익</span>{revenue}</span>}
              </div>
            )}

            <p className={styles.overview}>
              {movie.overview || '줄거리 정보가 없습니다.'}
            </p>

            {isAlreadyArchived && (
              <div className={styles.myReview}>
                <p>{'⭐'.repeat(archivedData.rating)} 내 별점 {archivedData.rating}점</p>
                {archivedData.review && <p>"{archivedData.review}"</p>}
              </div>
            )}

            <div className={styles.actionRow}>
              <button className={styles.archiveButton} onClick={handleOpenModal}>
                {isAlreadyArchived ? '✏️ 리뷰 수정' : '📁 보관함에 추가'}
              </button>
              <button
                className={`${styles.wishButton} ${isWishlisted ? styles.wishlisted : ''}`}
                onClick={handleWishlistToggle}
              >
                {isWishlisted ? '♥ 찜 해제' : '♡ 찜하기'}
              </button>
            </div>
          </div>
        </div>

        <div className={styles.sections}>
          {topCast.length > 0 && (
            <section>
              <h2 className={styles.sectionTitle}>출연</h2>
              <div className={styles.castScroll}>
                {topCast.map((actor) => (
                  <div key={actor.cast_id ?? actor.id} className={styles.castCard}>
                    <img
                      src={actor.profile_path
                        ? `${PROFILE_BASE_URL}${actor.profile_path}`
                        : PLACEHOLDER_PROFILE}
                      alt={actor.name}
                      className={styles.castPhoto}
                    />
                    <span className={styles.castName}>{actor.name}</span>
                    <span className={styles.castCharacter}>{actor.character}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {trailers.length > 0 && (
            <section>
              <h2 className={styles.sectionTitle}>
                예고편
                {trailers.length > 1 && (
                  <span className={styles.trailerCount}>{trailers.length}개</span>
                )}
              </h2>

              <div className={styles.trailerWrapper}>
                <iframe
                  key={activeTrailer.key}
                  className={styles.trailerIframe}
                  src={`https://www.youtube.com/embed/${activeTrailer.key}?rel=0&modestbranding=1`}
                  title={activeTrailer.name}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>

              {trailers.length > 1 && (
                <div className={styles.trailerList}>
                  {trailers.map((t, idx) => (
                    <button
                      key={t.key}
                      className={`${styles.trailerThumb} ${idx === activeTrailerIdx ? styles.trailerThumbActive : ''}`}
                      onClick={() => setActiveTrailerIdx(idx)}
                    >
                      <img
                        src={`https://img.youtube.com/vi/${t.key}/mqdefault.jpg`}
                        alt={t.name}
                        className={styles.trailerThumbImg}
                      />
                      <span className={styles.trailerThumbLabel}>{t.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </section>
          )}

          <section>
            <h2 className={styles.sectionTitle}>국내 감상 방법</h2>

            {streaming.length > 0 && (
              <div className={styles.providerGroup}>
                <p className={styles.providerGroupLabel}>스트리밍</p>
                <div className={styles.providerList}>
                  {streaming.map((p) => (
                    <a
                      key={p.provider_id}
                      href={watchKR.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.providerItem}
                      title={p.provider_name}
                    >
                      <img
                        src={`${PROVIDER_BASE_URL}${p.logo_path}`}
                        alt={p.provider_name}
                        className={styles.providerLogo}
                      />
                      <span>{p.provider_name}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {rentList.length > 0 && (
              <div className={styles.providerGroup}>
                <p className={styles.providerGroupLabel}>대여</p>
                <div className={styles.providerList}>
                  {rentList.map((p) => (
                    <a
                      key={p.provider_id}
                      href={watchKR.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.providerItem}
                      title={p.provider_name}
                    >
                      <img
                        src={`${PROVIDER_BASE_URL}${p.logo_path}`}
                        alt={p.provider_name}
                        className={styles.providerLogo}
                      />
                      <span>{p.provider_name}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {buyList.length > 0 && (
              <div className={styles.providerGroup}>
                <p className={styles.providerGroupLabel}>구매</p>
                <div className={styles.providerList}>
                  {buyList.map((p) => (
                    <a
                      key={p.provider_id}
                      href={watchKR.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.providerItem}
                      title={p.provider_name}
                    >
                      <img
                        src={`${PROVIDER_BASE_URL}${p.logo_path}`}
                        alt={p.provider_name}
                        className={styles.providerLogo}
                      />
                      <span>{p.provider_name}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {!hasProviders && (
              <p className={styles.noProvider}>현재 국내 스트리밍 정보가 없습니다.</p>
            )}

            <div className={styles.cinemaGroup}>
              <p className={styles.providerGroupLabel}>극장 예매</p>
              <div className={styles.cinemaLinks}>
                {KR_CINEMAS.map((c) => (
                  <a
                    key={c.name}
                    href={c.url(movie.title)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.cinemaLink}
                  >
                    {c.name}
                  </a>
                ))}
              </div>
            </div>
          </section>

          {(movie.production_companies ?? []).length > 0 && (
            <section>
              <h2 className={styles.sectionTitle}>제작사</h2>
              <div className={styles.companyList}>
                {movie.production_companies.slice(0, 6).map((c) => (
                  <div key={c.id} className={styles.companyItem}>
                    {c.logo_path
                      ? <img
                          src={`https://image.tmdb.org/t/p/w92${c.logo_path}`}
                          alt={c.name}
                          className={styles.companyLogo}
                        />
                      : <span className={styles.companyName}>{c.name}</span>
                    }
                  </div>
                ))}
              </div>
            </section>
          )}

          {reviews.length > 0 && (
            <section>
              <h2 className={styles.sectionTitle}>관람객 리뷰 (TMDB)</h2>
              <div className={styles.reviewList}>
                {reviews.map((review) => (
                  <div key={review.id} className={styles.reviewCard}>
                    <div className={styles.reviewHeader}>
                      <span className={styles.reviewAuthor}>{review.author}</span>
                      <div className={styles.reviewMeta}>
                        {review.author_details?.rating && (
                          <span className={styles.reviewRating}>
                            ⭐ {review.author_details.rating}/10
                          </span>
                        )}
                        <span>{new Date(review.created_at).toLocaleDateString('ko-KR')}</span>
                      </div>
                    </div>
                    <p className={styles.reviewContent}>{review.content}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      <ReviewModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        movie={movie}
        onSubmit={handleSubmitReview}
        initialData={archivedData}
      />
    </div>
  );
}

export default MovieDetail;
