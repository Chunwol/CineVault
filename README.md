# CineVault — 나만의 인생 영화 저장소

TMDB API 기반 영화 탐색 · 보관 · 취향 분석 웹앱

---

## 기술 스택

| 분류 | 사용 기술 |
|---|---|
| Framework | React 18 (Vite 6) |
| Language | JavaScript (ES2022+) |
| Routing | react-router-dom v6 |
| HTTP | Axios |
| Styling | CSS Modules |
| 상태 관리 | Redux Toolkit + localStorage |
| 외부 API | TMDB (The Movie Database) |

---

## 주요 기능

### 홈 — 영화 탐색
- **6개 탭**: 현재 상영작 / 박스오피스 / 개봉 예정 / 명작 컬렉션 / 장르 탐색 / 이전 상영작
- **검색**: Enter·버튼 제출 시에만 API 호출 (입력값/제출값 분리)
- **필터 패널**: 정렬 · 장르 복수 선택 · 최소 평점 · 개봉 연도 범위 (활성 시 `/discover`로 전환)
- **🇰🇷 한국 개봉작 필터**: 토글 활성화 시 TMDB에 한국 극장 개봉(release_type 2|3) 기록이 있는 영화만 표시
- **페이지네이션**: "더 불러오기" 버튼으로 TMDB 페이지 단위 추가 로드
- **장르 탐색**: 14개 장르 칩 선택
- **이전 상영작**: 연도(2000~) + 분기 필터

### 영화 상세
- backdrop 배경, 포스터, 메타 정보(개봉일 · TMDB 평점 · 런타임 · 장르 · 한국 관람등급)
- 감독 · 각본 · 제작비 · 수익, 출연진, 관람객 리뷰
- **예고편 iframe 임베드** (여러 개면 썸네일로 전환)
- **국내 감상 안내**: OTT 스트리밍/대여/구매(watch/providers) + CGV·롯데시네마·메가박스 예매 링크
- 보관함 추가 / 리뷰 수정 (별점 1~5 + 한 줄 평) / 찜하기

### 아카이브 — 내 보관함
- 보관된 영화 목록 (localStorage 영구 저장)
- **정렬**: 등록순 / 별점순 / 최신순
- **장르 필터**: 보관된 영화의 장르 기준 필터링
- 수정 / 삭제

### 찜 목록 (Wishlist)
- 모든 영화 카드의 ♥ 버튼으로 원클릭 찜/해제
- 헤더에 찜 개수 실시간 뱃지

### 취향 분석
- 총 편수 · 평균 별점 · 최애 장르 통계 카드
- 장르 분포 바 차트
- 별점 분포 바 차트

---

## 시작하기

### 1. 저장소 클론 및 의존성 설치

```bash
git clone <repo-url>
cd CineVault
npm install
```

### 2. 환경 변수 설정

```bash
cp .env.example .env
```

`.env` 파일을 열고 TMDB API 키를 입력합니다.

```bash
VITE_TMDB_API_KEY=your_tmdb_api_key_here
```

> TMDB API 키는 [https://www.themoviedb.org/settings/api](https://www.themoviedb.org/settings/api) 에서 발급받을 수 있습니다.

### 3. 개발 서버 실행

```bash
npm run dev
```

---

## 프로젝트 구조

```
src/
├── apis/
│   ├── instance.js          # Axios 인스턴스 (baseURL, api_key, language 설정)
│   └── tmdb.js              # TMDB API 호출 함수 모음
├── components/
│   ├── common/
│   │   ├── FilterPanel/     # 정렬·장르·평점·연도 공통 필터 패널
│   │   ├── LoadingSpinner   # 로딩 스피너
│   │   ├── MovieCard        # 홈·아카이브·찜 공용 영화 카드
│   │   ├── ReviewModal      # 별점·한 줄 평 입력 모달
│   │   └── StarRating       # 별점 선택/표시 컴포넌트
│   └── layout/
│       └── Header           # 상단 네비게이션
├── constants/
│   ├── genres.js            # TMDB 장르 ID·이름 매핑
│   └── routes.js            # 라우트 경로 상수
├── hooks/
│   ├── useDebounce.js       # 디바운스 커스텀 훅
│   └── useMovies.js         # 영화 페칭·페이지네이션 (useReducer 기반)
├── pages/
│   ├── Home                 # 영화 탐색 메인 페이지
│   ├── MovieDetail          # 영화 상세 페이지
│   ├── Archive              # 내 아카이브 페이지
│   ├── Analytics            # 취향 분석 페이지
│   └── Wishlist             # 찜 목록 페이지
├── store/
│   ├── index.js             # Redux store
│   ├── archiveSlice.js      # 보관함 상태 (localStorage 동기화)
│   └── wishlistSlice.js     # 찜 목록 상태 (localStorage 동기화)
└── utils/
    └── localStorage.js      # 보관함·찜 CRUD (localStorage 래퍼)
```

---

## 코드 컨벤션

### 네이밍
| 대상 | 규칙 | 예시 |
|---|---|---|
| 컴포넌트 파일 | PascalCase + `.jsx` | `MovieCard.jsx` |
| 일반 JS 파일 | camelCase + `.js` | `useDebounce.js` |
| 상수 | UPPER_SNAKE_CASE | `SEARCH_DEBOUNCE_MS` |
| Boolean 변수 | `is` / `has` / `can` 접두사 | `isLoading`, `hasMore` |
| 이벤트 핸들러 | `handle` + 동작 | `handleTabChange` |
| props 핸들러 | `on` + 동작 | `onSubmit`, `onClose` |

- 단일 문자 약어 금지 (`m`, `g`, `q` 등) — 콜백 파라미터도 전체 이름 사용
- `data`, `info`, `value` 단독 사용 금지 — `movieData`처럼 맥락 포함

### 컴포넌트 작성 순서
1. import
2. 상수 / 외부 선언
3. 컴포넌트 함수
4. 상태 (useState)
5. 훅 / useEffect
6. 핸들러 함수
7. 파생 변수 (계산된 값)
8. 조건부 early return (로딩 · 에러)
9. JSX return
10. export default

### Import 순서
```js
// 1. React 및 외부 라이브러리
import { useState } from 'react';

// 2. 절대 경로 내부 모듈 (@/ 별칭)
import { fetchPopularMovies } from '@/apis/tmdb';

// 3. 상대 경로 내부 모듈
import SubComponent from './SubComponent';

// 4. 스타일
import styles from './Component.module.css';
```

### 주석
- "무엇"이 아닌 "왜"를 한국어로 작성
- 재사용 컴포넌트 · 유틸 함수에는 JSDoc 작성

---

## 환경 변수

| 변수 | 설명 |
|---|---|
| `VITE_TMDB_API_KEY` | TMDB v3 API 키 |

`.env`는 절대 커밋하지 않습니다. `.env.example`을 참고하세요.

---

_Last Updated: 2026.06.12_
