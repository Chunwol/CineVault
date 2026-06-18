import { Routes, Route } from 'react-router-dom';

import { ROUTES } from '@/constants/routes';
import Header from '@/components/layout/Header';
import Home from '@/pages/Home';
import MovieDetail from '@/pages/MovieDetail';
import Archive from '@/pages/Archive';
import Analytics from '@/pages/Analytics';
import Wishlist from '@/pages/Wishlist';

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path={ROUTES.HOME}         element={<Home />} />
        <Route path={ROUTES.MOVIE_DETAIL} element={<MovieDetail />} />
        <Route path={ROUTES.ARCHIVE}      element={<Archive />} />
        <Route path={ROUTES.ANALYTICS}    element={<Analytics />} />
        <Route path={ROUTES.WISHLIST}     element={<Wishlist />} />
      </Routes>
    </>
  );
}

export default App;
