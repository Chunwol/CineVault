import { useState } from 'react';

import styles from './StarRating.module.css';

const MAX_STARS = 5;

/**
 * 별점 선택/표시 컴포넌트
 * @param {number} value - 현재 별점 (1~5)
 * @param {Function} onChange - 별점 변경 콜백
 * @param {boolean} [readOnly=false] - true이면 클릭 불가, 표시 전용
 */
function StarRating({ value, onChange, readOnly = false }) {
  const [hovered, setHovered] = useState(0);

  const displayValue = hovered || value;

  const handleClick = (star) => {
    if (!readOnly) onChange(star);
  };

  return (
    <div className={styles.container}>
      {Array.from({ length: MAX_STARS }, (_, i) => i + 1).map((star) => (
        <button
          key={star}
          type="button"
          className={`${styles.star} ${star <= displayValue ? styles.filled : ''}`}
          onClick={() => handleClick(star)}
          onMouseEnter={() => !readOnly && setHovered(star)}
          onMouseLeave={() => !readOnly && setHovered(0)}
          disabled={readOnly}
          aria-label={`${star}점`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default StarRating;
