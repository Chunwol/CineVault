import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { ROUTES } from '@/constants/routes';

import styles from './Header.module.css';

function Header() {
  const wishlistCount = useSelector((state) => state.wishlist.movies.length);
  const getLinkClass = ({ isActive }) => (isActive ? styles.activeLink : styles.link);

  return (
    <header className={styles.header}>
      <NavLink to={ROUTES.HOME} className={styles.logo} end>
        CineVault
      </NavLink>
      <nav className={styles.nav}>
        <NavLink to={ROUTES.HOME} className={getLinkClass} end>홈</NavLink>
        <NavLink to={ROUTES.ARCHIVE} className={getLinkClass}>내 아카이브</NavLink>
        <NavLink to={ROUTES.ANALYTICS} className={getLinkClass}>취향 분석</NavLink>
        <NavLink to={ROUTES.WISHLIST} className={getLinkClass}>
          찜 목록
          {wishlistCount > 0 && (
            <span className={styles.badge}>{wishlistCount}</span>
          )}
        </NavLink>
      </nav>
    </header>
  );
}

export default Header;
