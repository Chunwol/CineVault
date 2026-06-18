import { useSelector } from 'react-redux';

import styles from './Analytics.module.css';

function Analytics() {
  const archivedMovies = useSelector((state) => state.archive.movies);

  if (archivedMovies.length === 0) {
    return (
      <main className={styles.container}>
        <h1 className={styles.heading}>나만의 영화 취향 분석</h1>
        <p className={styles.empty}>아직 등록된 인생 영화가 없습니다.</p>
      </main>
    );
  }

  const genreCount = archivedMovies
    .flatMap((movie) => movie.genres ?? [])
    .reduce((acc, genre) => {
      acc[genre] = (acc[genre] ?? 0) + 1;
      return acc;
    }, {});

  const sortedGenres = Object.entries(genreCount).sort(([, a], [, b]) => b - a);
  const topGenre = sortedGenres[0]?.[0] ?? '없음';
  const maxGenreCount = sortedGenres[0]?.[1] ?? 1;

  const averageRating = (
    archivedMovies.reduce((sum, movie) => sum + (movie.rating ?? 0), 0) / archivedMovies.length
  ).toFixed(1);

  const ratingDistribution = Array.from({ length: 5 }, (_, i) => ({
    star: i + 1,
    count: archivedMovies.filter((movie) => movie.rating === i + 1).length,
  }));

  return (
    <main className={styles.container}>
      <h1 className={styles.heading}>나만의 영화 취향 분석</h1>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>총 인생 영화</span>
          <span className={styles.statValue}>{archivedMovies.length}편</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>평균 별점</span>
          <span className={styles.statValue}>⭐ {averageRating}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>최애 장르</span>
          <span className={styles.statValue}>{topGenre}</span>
        </div>
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>장르 분포</h2>
        <div className={styles.barChart}>
          {sortedGenres.map(([genre, count]) => (
            <div key={genre} className={styles.barRow}>
              <span className={styles.barLabel}>{genre}</span>
              <div className={styles.barTrack}>
                <div
                  className={styles.bar}
                  style={{ width: `${(count / maxGenreCount) * 100}%` }}
                />
              </div>
              <span className={styles.barCount}>{count}편</span>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>별점 분포</h2>
        <div className={styles.barChart}>
          {ratingDistribution.map(({ star, count }) => (
            <div key={star} className={styles.barRow}>
              <span className={styles.barLabel}>{'★'.repeat(star)}</span>
              <div className={styles.barTrack}>
                <div
                  className={styles.bar}
                  style={{
                    width: count > 0 ? `${(count / archivedMovies.length) * 100}%` : '0%',
                  }}
                />
              </div>
              <span className={styles.barCount}>{count}편</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

export default Analytics;
