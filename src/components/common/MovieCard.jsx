import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import { POSTER_BASE_URL } from '@/apis/tmdb';
import { toggleWishlist } from '@/store/wishlistSlice';

import styles from './MovieCard.module.css';

const PLACEHOLDER_POSTER = 'https://placehold.co/500x750/f4f6fb/c0c5d0?text=No+Image';

/**
 * 홈·아카이브·찜 목록에서 재사용되는 영화 카드
 * @param {Object}   movie     - TMDB 또는 아카이브 형식의 영화 데이터
 * @param {Function} [onEdit]  - 전달 시 수정 버튼 표시
 * @param {Function} [onDelete]- 전달 시 삭제 버튼 표시
 */
function MovieCard({ movie, onEdit, onDelete }) {
  const dispatch = useDispatch();
  const isWishlisted = useSelector((state) =>
    state.wishlist.movies.some((m) => m.id === movie.id)
  );

  const posterUrl = movie.poster_path
    ? `${POSTER_BASE_URL}${movie.poster_path}`
    : PLACEHOLDER_POSTER;

  const releaseYear = movie.release_date?.slice(0, 4);
  const tmdbRating  = movie.vote_average ? Number(movie.vote_average).toFixed(1) : null;

  const handleWishlistToggle = (e) => {
    e.preventDefault(); // Link 클릭 방지
    e.stopPropagation();
    dispatch(toggleWishlist(movie));
  };

  return (
    <div className={styles.card}>
      <Link to={`/movie/${movie.id}`} className={styles.posterLink}>
        <img src={posterUrl} alt={movie.title} className={styles.poster} />

        <button
          className={`${styles.wishBtn} ${isWishlisted ? styles.wishlisted : ''}`}
          onClick={handleWishlistToggle}
          title={isWishlisted ? '찜 해제' : '찜하기'}
        >
          {isWishlisted ? '♥' : '♡'}
        </button>

        <div className={styles.overlay}>
          <span className={styles.viewDetail}>자세히 보기</span>
        </div>
      </Link>

      <div className={styles.info}>
        <h3 className={styles.title}>{movie.title}</h3>

        <div className={styles.meta}>
          {releaseYear && <span className={styles.releaseYear}>{releaseYear}</span>}
          {tmdbRating && <span className={styles.tmdbRating}>⭐ {tmdbRating}</span>}
        </div>

        {movie.rating !== undefined && (
          <p className={styles.myRating}>내 별점 {'⭐'.repeat(movie.rating)}</p>
        )}
        {movie.review && (
          <p className={styles.review}>"{movie.review}"</p>
        )}

        {(onEdit || onDelete) && (
          <div className={styles.actions}>
            {onEdit && (
              <button className={styles.editButton} onClick={() => onEdit(movie)}>수정</button>
            )}
            {onDelete && (
              <button className={styles.deleteButton} onClick={() => onDelete(movie.id)}>삭제</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default MovieCard;
