# 작업 가이드

이 문서는 새로운 페이지, 컴포넌트, API 등을 추가할 때 참고하는 가이드입니다.

---

## 프로젝트 구조

```
src/
├── app/                  # 페이지 (라우팅)
│   ├── layout.tsx        # 전체 레이아웃 (건드릴 일 거의 없음)
│   ├── providers.tsx     # TanStack Query 등 전역 Provider
│   ├── globals.css       # 전역 스타일
│   ├── page.tsx          # 홈 (/)
│   ├── search/page.tsx   # 검색 (/search)
│   └── profile/page.tsx  # 마이페이지 (/profile)
├── components/           # 재사용 컴포넌트
│   └── bottom-nav.tsx    # 하단 탭 네비게이션
├── lib/                  # 유틸 함수, API 호출 함수
├── hooks/                # 커스텀 훅 (useXxx)
├── types/                # 타입 정의
└── stores/               # Zustand 스토어
```

> `lib/`, `hooks/`, `types/`, `stores/` 폴더는 필요할 때 만들면 됩니다.

---

## 1. 새 페이지 추가하기

예시: `/settings` 페이지를 추가한다고 가정

### 순서

1. **타입 정의** (필요한 경우)  
   `src/types/settings.ts` 생성 → 해당 페이지에서 쓸 데이터 타입 정의

2. **API 함수 작성** (서버 데이터가 필요한 경우)  
   `src/lib/api/settings.ts` 생성 → fetch 함수 작성

3. **컴포넌트 작성** (페이지에서 쓸 UI 조각)  
   `src/components/settings/` 폴더 생성 → 컴포넌트 파일 추가

4. **페이지 파일 생성**  
   `src/app/settings/page.tsx` 생성 → 컴포넌트 조합해서 페이지 완성

5. **네비게이션 연결** (필요한 경우)  
   `src/components/bottom-nav.tsx` → `navItems` 배열에 항목 추가

### 페이지 기본 템플릿

```tsx
import { BottomNav } from "@/components/bottom-nav";

export default function SettingsPage() {
  return (
    <div className="flex h-full flex-col">
      <header className="flex h-12 shrink-0 items-center justify-center border-b border-zinc-200 pt-[var(--safe-area-top)] dark:border-zinc-800">
        <h1 className="text-base font-semibold">설정</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        {/* 여기에 내용 */}
      </main>

      <BottomNav />
    </div>
  );
}
```

---

## 2. 새 컴포넌트 추가하기

### 순서

1. **어디에 만들지 결정**
   - 여러 페이지에서 쓰는 공통 컴포넌트 → `src/components/`
   - 특정 페이지 전용 → `src/components/페이지명/`

2. **파일 생성**  
   - 파일명은 kebab-case: `user-card.tsx`, `setting-item.tsx`

3. **클라이언트 컴포넌트인지 확인**  
   - `onClick`, `useState`, `useEffect` 등을 쓰면 파일 맨 위에 `"use client";` 추가
   - 아무 인터랙션 없으면 안 써도 됨 (서버 컴포넌트)

### 컴포넌트 기본 템플릿

```tsx
// 서버 컴포넌트 (기본)
interface UserCardProps {
  name: string;
  email: string;
}

export function UserCard({ name, email }: UserCardProps) {
  return (
    <div className="rounded-xl border p-4">
      <p className="font-semibold">{name}</p>
      <p className="text-sm text-zinc-500">{email}</p>
    </div>
  );
}
```

```tsx
// 클라이언트 컴포넌트 (인터랙션 있을 때)
"use client";

import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

---

## 3. 타입 추가하기

### 순서

1. `src/types/` 폴더에 도메인별로 파일 생성
2. 해당 파일에서 `export`

### 예시

```ts
// src/types/user.ts
export interface User {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
}
```

```tsx
// 사용하는 곳에서
import type { User } from "@/types/user";
```

---

## 4. API 데이터 연동하기

### 순서

1. **타입 정의** → `src/types/`
2. **API 함수 작성** → `src/lib/api/`
3. **커스텀 훅 작성** → `src/hooks/`
4. **컴포넌트에서 훅 사용**

### 예시: 유저 목록 가져오기

```ts
// 1) src/types/user.ts
export interface User {
  id: string;
  name: string;
}

// 2) src/lib/api/user.ts
import type { User } from "@/types/user";

export async function getUsers(): Promise<User[]> {
  const res = await fetch("/api/users");
  return res.json();
}

// 3) src/hooks/use-users.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { getUsers } from "@/lib/api/user";

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });
}

// 4) 컴포넌트에서 사용
"use client";

import { useUsers } from "@/hooks/use-users";

export function UserList() {
  const { data: users, isLoading } = useUsers();

  if (isLoading) return <p>로딩 중...</p>;

  return (
    <ul>
      {users?.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

---

## 5. 상태 관리 (Zustand)

### 순서

1. `src/stores/` 폴더에 스토어 파일 생성
2. 컴포넌트에서 import해서 사용

### 예시

```ts
// src/stores/use-auth-store.ts
import { create } from "zustand";

interface AuthState {
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  login: () => set({ isLoggedIn: true }),
  logout: () => set({ isLoggedIn: false }),
}));
```

```tsx
// 컴포넌트에서 사용
"use client";

import { useAuthStore } from "@/stores/use-auth-store";

export function LoginButton() {
  const { isLoggedIn, login, logout } = useAuthStore();
  return (
    <button onClick={isLoggedIn ? logout : login}>
      {isLoggedIn ? "로그아웃" : "로그인"}
    </button>
  );
}
```

---

## 파일 이름 규칙

| 종류 | 규칙 | 예시 |
|------|------|------|
| 컴포넌트 파일 | kebab-case | `user-card.tsx` |
| 컴포넌트 이름 | PascalCase | `UserCard` |
| 훅 파일 | `use-xxx.ts` | `use-users.ts` |
| 훅 이름 | `useXxx` | `useUsers` |
| 타입 파일 | kebab-case | `user.ts` |
| 스토어 파일 | `use-xxx-store.ts` | `use-auth-store.ts` |
| API 함수 | camelCase | `getUsers`, `createPost` |

---

## 자주 쓰는 명령어

```bash
pnpm dev          # 개발 서버 실행 (http://localhost:3000)
pnpm build        # 프로덕션 빌드
pnpm lint         # 코드 검사
```
