import { useState, useEffect } from 'react';

import StarRating from './StarRating';

import styles from './ReviewModal.module.css';

/**
 * 별점 + 한 줄 평 작성/수정 모달
 * @param {boolean} isOpen - 모달 열림 여부
 * @param {Function} onClose - 닫기 핸들러
 * @param {Object} movie - 리뷰 대상 영화 (TMDB 상세 형식)
 * @param {Function} onSubmit - 제출 시 호출 (리뷰 데이터 전달)
 * @param {Object} [initialData] - 수정 시 기존 데이터
 */
function ReviewModal({ isOpen, onClose, movie, onSubmit, initialData }) {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');

  useEffect(() => {
    if (isOpen) {
      setRating(initialData?.rating ?? 0);
      setReview(initialData?.review ?? '');
    }
  }, [isOpen, initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      id: Number(movie.id),
      title: movie.title,
      poster_path: movie.poster_path,
      release_date: movie.release_date,
      vote_average: movie.vote_average,
      genres: movie.genres?.map((genre) => genre.name ?? genre) ?? [],
      rating,
      review,
      archivedAt: initialData?.archivedAt ?? new Date().toISOString(),
    });
    onClose();
  };

  const handleOverlayClick = () => onClose();
  const handleModalClick = (e) => e.stopPropagation();

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal} onClick={handleModalClick}>
        <h2 className={styles.movieTitle}>{movie.title}</h2>
        <p className={styles.subtitle}>인생 영화로 등록하기</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>별점</label>
            <StarRating value={rating} onChange={setRating} />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="review-textarea">
              한 줄 평
            </label>
            <textarea
              id="review-textarea"
              className={styles.textarea}
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="이 영화를 한 줄로 표현한다면..."
              rows={3}
              required
            />
          </div>

          <div className={styles.buttons}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>
              취소
            </button>
            <button type="submit" className={styles.submitButton} disabled={rating === 0}>
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReviewModal;
