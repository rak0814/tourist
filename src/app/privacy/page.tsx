import { BackButton } from "@/components/back-button";

export default function PrivacyPage() {
  return (
    <div className="flex h-full flex-col">
      <header className="relative flex h-12 shrink-0 items-center justify-center border-b border-zinc-200 px-4 pt-[var(--safe-area-top)] dark:border-zinc-800">
        <BackButton />
        <h1 className="text-base font-semibold">개인정보처리방침</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-5 py-6">
        <p className="text-xs text-zinc-400">시행일: 2026년 8월 7일</p>
        <p className="mt-3 text-[13px] leading-relaxed text-zinc-600 dark:text-zinc-400">
          My App(이하 &quot;서비스&quot;)는 이용자의 개인정보를 소중히 여기며, 「개인정보 보호법」 등 관련 법령을 준수합니다. 본 방침을 통해 이용자의 개인정보가 어떻게 수집·이용·보관·파기되는지 안내합니다.
        </p>

        <Section title="1. 수집하는 개인정보 항목">
          <div className="overflow-x-auto">
            <table className="mt-2 w-full border-collapse text-[13px]">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-800">
                  <th className="border border-zinc-200 px-3 py-2 text-left font-semibold dark:border-zinc-700">수집 시점</th>
                  <th className="border border-zinc-200 px-3 py-2 text-left font-semibold dark:border-zinc-700">수집 항목</th>
                  <th className="border border-zinc-200 px-3 py-2 text-left font-semibold dark:border-zinc-700">수집 목적</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-zinc-200 px-3 py-2 dark:border-zinc-700">회원가입</td>
                  <td className="border border-zinc-200 px-3 py-2 dark:border-zinc-700">이메일, 비밀번호(암호화), 닉네임</td>
                  <td className="border border-zinc-200 px-3 py-2 dark:border-zinc-700">회원 식별 및 서비스 제공</td>
                </tr>
                <tr>
                  <td className="border border-zinc-200 px-3 py-2 dark:border-zinc-700">서비스 이용</td>
                  <td className="border border-zinc-200 px-3 py-2 dark:border-zinc-700">게시글, 댓글 내용</td>
                  <td className="border border-zinc-200 px-3 py-2 dark:border-zinc-700">커뮤니티 기능 제공</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="2. 개인정보의 이용 목적">
          <ul className="list-disc space-y-0.5 pl-5">
            <li>회원 가입 및 본인 확인</li>
            <li>서비스 제공 및 운영 (게시판 등)</li>
            <li>서비스 개선 및 오류 대응</li>
          </ul>
        </Section>

        <Section title="3. 개인정보의 보유 및 이용 기간">
          <p>이용자의 개인정보는 회원 탈퇴 시 <strong>즉시 삭제</strong>합니다. 단, 관련 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관합니다.</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-5">
            <li>전자상거래법에 따른 계약·거래 기록: 5년</li>
            <li>통신비밀보호법에 따른 접속 기록: 3개월</li>
          </ul>
        </Section>

        <Section title="4. 개인정보의 제3자 제공">
          <p>서비스는 이용자의 개인정보를 원칙적으로 제3자에게 제공하지 않습니다. 다만, 다음의 경우는 예외로 합니다.</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-5">
            <li>이용자가 사전에 동의한 경우</li>
            <li>법령에 의해 요구되는 경우</li>
          </ul>
        </Section>

        <Section title="5. 개인정보의 처리 위탁">
          <div className="overflow-x-auto">
            <table className="mt-2 w-full border-collapse text-[13px]">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-800">
                  <th className="border border-zinc-200 px-3 py-2 text-left font-semibold dark:border-zinc-700">수탁 업체</th>
                  <th className="border border-zinc-200 px-3 py-2 text-left font-semibold dark:border-zinc-700">위탁 업무</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-zinc-200 px-3 py-2 dark:border-zinc-700">Supabase Inc.</td>
                  <td className="border border-zinc-200 px-3 py-2 dark:border-zinc-700">클라우드 데이터베이스 및 인증 서비스 운영</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-2">위탁 업체는 개인정보 보호를 위해 적절한 기술적·관리적 조치를 취하고 있습니다.</p>
        </Section>

        <Section title="6. 개인정보의 파기 절차 및 방법">
          <ul className="list-disc space-y-0.5 pl-5">
            <li><strong>파기 절차:</strong> 회원 탈퇴 요청 시 해당 이용자의 개인정보를 지체 없이 파기합니다.</li>
            <li><strong>파기 방법:</strong> 전자적 파일은 복구할 수 없는 방법으로 영구 삭제합니다.</li>
          </ul>
        </Section>

        <Section title="7. 이용자의 권리와 행사 방법">
          <p>이용자는 언제든지 다음의 권리를 행사할 수 있습니다.</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-5">
            <li>개인정보 열람 요청</li>
            <li>개인정보 수정 (닉네임 변경 등)</li>
            <li>개인정보 삭제 및 회원 탈퇴</li>
            <li>개인정보 처리 정지 요청</li>
          </ul>
        </Section>

        <Section title="8. 개인정보 보호책임자">
          <div className="overflow-x-auto">
            <table className="mt-2 w-full border-collapse text-[13px]">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-800">
                  <th className="border border-zinc-200 px-3 py-2 text-left font-semibold dark:border-zinc-700">구분</th>
                  <th className="border border-zinc-200 px-3 py-2 text-left font-semibold dark:border-zinc-700">내용</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-zinc-200 px-3 py-2 dark:border-zinc-700">책임자</td>
                  <td className="border border-zinc-200 px-3 py-2 dark:border-zinc-700">서비스 운영자</td>
                </tr>
                <tr>
                  <td className="border border-zinc-200 px-3 py-2 dark:border-zinc-700">연락처</td>
                  <td className="border border-zinc-200 px-3 py-2 dark:border-zinc-700">generalist.app.help@gmail.com</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="9. 개인정보의 안전성 확보 조치">
          <ul className="list-disc space-y-0.5 pl-5">
            <li>비밀번호는 암호화(해시)하여 저장하며, 운영자도 확인할 수 없습니다.</li>
            <li>HTTPS를 통한 데이터 전송 암호화</li>
            <li>접근 권한 최소화 및 관리</li>
          </ul>
        </Section>

        <Section title="10. 방침의 변경">
          <p>본 방침이 변경되는 경우, 시행일 최소 7일 전에 서비스 내 공지를 통해 안내합니다.</p>
        </Section>

        <p className="mt-8 border-t border-zinc-100 pt-4 text-xs text-zinc-400 dark:border-zinc-800">
          본 개인정보처리방침은 2026년 8월 7일부터 시행됩니다.
        </p>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6">
      <h2 className="border-b border-zinc-100 pb-1.5 text-[15px] font-bold dark:border-zinc-800">{title}</h2>
      <div className="mt-2 text-[13px] leading-relaxed text-zinc-600 dark:text-zinc-400">{children}</div>
    </div>
  );
}
