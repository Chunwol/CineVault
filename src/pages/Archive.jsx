import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { updateMovie, removeMovie } from '@/store/archiveSlice';
import MovieCard from '@/components/common/MovieCard';
import ReviewModal from '@/components/common/ReviewModal';

import styles from './Archive.module.css';

const ALL_GENRES_LABEL = '전체';

const SORT_OPTIONS = [
  { label: '등록순', value: 'archivedAt' },
  { label: '별점순', value: 'rating' },
  { label: '최신순', value: 'releaseDate' },
];

function Archive() {
  const archivedMovies = useSelector((state) => state.archive.movies);
  const dispatch = useDispatch();
  const [selectedGenre, setSelectedGenre] = useState(ALL_GENRES_LABEL);
  const [sortBy, setSortBy] = useState('archivedAt');
  const [editingMovie, setEditingMovie] = useState(null);

  const handleGenreSelect = (genre) => setSelectedGenre(genre);
  const handleSortChange = (value) => setSortBy(value);
  const handleEdit = (movie) => setEditingMovie(movie);
  const handleCloseModal = () => setEditingMovie(null);

  const handleSubmitEdit = (reviewData) => {
    dispatch(updateMovie(reviewData));
    setEditingMovie(null);
  };

  const handleDelete = (id) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      dispatch(removeMovie(id));
    }
  };

  const allGenres = [
    ALL_GENRES_LABEL,
    ...new Set(archivedMovies.flatMap((movie) => movie.genres ?? [])),
  ];

  const filteredMovies =
    selectedGenre === ALL_GENRES_LABEL
      ? archivedMovies
      : archivedMovies.filter((movie) => movie.genres?.includes(selectedGenre));

  const sortedMovies = [...filteredMovies].sort((a, b) => {
    if (sortBy === 'rating') return (b.rating ?? 0) - (a.rating ?? 0);
    if (sortBy === 'releaseDate') {
      return new Date(b.release_date ?? 0) - new Date(a.release_date ?? 0);
    }
    return new Date(b.archivedAt ?? 0) - new Date(a.archivedAt ?? 0);
  });

  return (
    <main className={styles.container}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.heading}>나만의 아카이브</h1>
          <p className={styles.count}>총 {archivedMovies.length}편의 인생 영화</p>
        </div>

        <div className={styles.sortButtons}>
          {SORT_OPTIONS.map(({ label, value }) => (
            <button
              key={value}
              className={`${styles.sortButton} ${sortBy === value ? styles.activeSort : ''}`}
              onClick={() => handleSortChange(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.genreFilters}>
        {allGenres.map((genre) => (
          <button
            key={genre}
            className={`${styles.filterButton} ${selectedGenre === genre ? styles.activeFilter : ''}`}
            onClick={() => handleGenreSelect(genre)}
          >
            {genre}
          </button>
        ))}
      </div>

      {sortedMovies.length === 0 ? (
        <p className={styles.empty}>
          {archivedMovies.length === 0
            ? '아직 추가된 인생 영화가 없습니다. 영화를 검색하고 보관함에 추가해보세요!'
            : '선택한 장르의 영화가 없습니다.'}
        </p>
      ) : (
        <div className={styles.grid}>
          {sortedMovies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {editingMovie && (
        <ReviewModal
          isOpen
          onClose={handleCloseModal}
          movie={editingMovie}
          onSubmit={handleSubmitEdit}
          initialData={editingMovie}
        />
      )}
    </main>
  );
}

export default Archive;
