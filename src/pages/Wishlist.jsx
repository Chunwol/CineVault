import { useSelector } from 'react-redux';

import MovieCard from '@/components/common/MovieCard';

import styles from './Wishlist.module.css';

function Wishlist() {
  const wishlistMovies = useSelector((state) => state.wishlist.movies);

  return (
    <main className={styles.container}>
      <div className={styles.pageHeader}>
        <h1 className={styles.heading}>찜 목록</h1>
        <p className={styles.count}>총 {wishlistMovies.length}편</p>
      </div>

      {wishlistMovies.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyIcon}>♡</p>
          <p>아직 찜한 영화가 없습니다.</p>
          <p className={styles.emptyHint}>영화 카드의 하트 버튼을 눌러 찜 목록에 추가해보세요!</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {wishlistMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}
    </main>
  );
}

export default Wishlist;
