// 아카이브 (별점·리뷰 저장)
const ARCHIVE_KEY = 'cinevault_archive';

export const getArchivedMovies = () => {
  const stored = localStorage.getItem(ARCHIVE_KEY);
  return stored ? JSON.parse(stored) : [];
};

const saveArchive = (list) => localStorage.setItem(ARCHIVE_KEY, JSON.stringify(list));

export const addArchivedMovie = (movie) => {
  const archived = getArchivedMovies();
  if (archived.some((m) => m.id === movie.id)) return;
  saveArchive([...archived, movie]);
};

export const updateArchivedMovie = (updatedMovie) => {
  saveArchive(getArchivedMovies().map((m) => (m.id === updatedMovie.id ? updatedMovie : m)));
};

export const deleteArchivedMovie = (movieId) => {
  saveArchive(getArchivedMovies().filter((m) => m.id !== movieId));
};

// 찜 목록 (위시리스트)
const WISHLIST_KEY = 'cinevault_wishlist';

export const getWishlist = () => {
  const stored = localStorage.getItem(WISHLIST_KEY);
  return stored ? JSON.parse(stored) : [];
};

const saveWishlist = (list) => localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));

export const addToWishlist = (movie) => {
  const list = getWishlist();
  if (list.some((m) => m.id === movie.id)) return;
  saveWishlist([...list, movie]);
};

export const removeFromWishlist = (movieId) => {
  saveWishlist(getWishlist().filter((m) => m.id !== movieId));
};
