import styles from './LoadingSpinner.module.css';

function LoadingSpinner() {
  return (
    <div className={styles.container}>
      <div className={styles.spinner} role="status" aria-label="로딩 중" />
    </div>
  );
}

export default LoadingSpinner;
