import { NextRequest, NextResponse } from "next/server";

// 임시 더미 데이터 30개
const allPosts = Array.from({ length: 30 }, (_, i) => {
  const id = String(i + 1);
  const titles = [
    "첫 번째 게시글입니다",
    "Next.js 모바일 앱 만들기",
    "오늘 날씨가 좋네요",
    "맛집 추천 부탁드립니다",
    "주말에 뭐하시나요?",
    "TypeScript 꿀팁 공유합니다",
    "React 상태관리 어떤 거 쓰세요?",
    "카페 추천해주세요",
    "운동 루틴 공유합니다",
    "독서 모임 같이 하실 분",
    "여행지 추천 받습니다",
    "프로젝트 팀원 모집합니다",
    "이직 고민 중입니다",
    "면접 후기 공유합니다",
    "오늘 점심 뭐 드셨나요?",
    "새로 나온 영화 재밌네요",
    "집에서 할 수 있는 취미 추천",
    "개발 공부 어떻게 하시나요?",
    "재택근무 꿀팁",
    "좋은 모니터 추천해주세요",
    "요즘 읽고 있는 책",
    "음악 추천 부탁드려요",
    "강아지 키우시는 분 있나요?",
    "자취 꿀팁 공유",
    "다이어트 식단 공유합니다",
    "주식 초보 질문이요",
    "영어 공부 같이 하실 분",
    "사이드 프로젝트 아이디어",
    "연말 계획 세우셨나요?",
    "올해 가장 잘한 일",
  ];
  const authors = ["김철수", "이영희", "박민수", "정수진", "최동현", "한지민", "오세준", "윤서연"];
  const days = 30 - i;
  const date = new Date(2026, 8, 1);
  date.setDate(date.getDate() - Math.floor(i / 3));

  return {
    id,
    title: titles[i % titles.length],
    author: authors[i % authors.length],
    date: date.toISOString().split("T")[0],
    commentCount: Math.floor(Math.random() * 20),
  };
});

const PAGE_SIZE = 10;

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const cursor = searchParams.get("cursor") ?? "0";
  const start = Number(cursor);

  const posts = allPosts.slice(start, start + PAGE_SIZE);
  const nextCursor = start + PAGE_SIZE < allPosts.length ? start + PAGE_SIZE : null;

  return NextResponse.json({ posts, nextCursor });
}
