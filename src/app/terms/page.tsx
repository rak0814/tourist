import { BackButton } from "@/components/back-button";

export default function TermsPage() {
  return (
    <div className="flex h-full flex-col">
      <header className="relative flex h-12 shrink-0 items-center justify-center border-b border-zinc-200 px-4 pt-[var(--safe-area-top)] dark:border-zinc-800">
        <BackButton />
        <h1 className="text-base font-semibold">이용약관</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-5 py-6">
        <p className="text-xs text-zinc-400">시행일: 2026년 8월 7일</p>

        <Section title="제1조 (목적)">
          <p>본 약관은 My App(이하 &quot;서비스&quot;)가 제공하는 모든 서비스의 이용과 관련하여 서비스 운영자(이하 &quot;운영자&quot;)와 이용자 간의 권리, 의무, 책임 및 기타 필요한 사항을 규정함을 목적으로 합니다.</p>
        </Section>

        <Section title="제2조 (정의)">
          <ol className="list-decimal space-y-1 pl-5">
            <li><strong>&quot;서비스&quot;</strong>란 운영자가 제공하는 웹 애플리케이션 및 관련 부가 서비스를 말합니다.</li>
            <li><strong>&quot;이용자&quot;</strong>란 본 약관에 동의하고 서비스를 이용하는 자를 말합니다.</li>
            <li><strong>&quot;회원&quot;</strong>이란 서비스에 회원가입을 하고 계정을 부여받은 이용자를 말합니다.</li>
          </ol>
        </Section>

        <Section title="제3조 (약관의 효력 및 변경)">
          <ol className="list-decimal space-y-1 pl-5">
            <li>본 약관은 서비스 내에 게시하거나 기타 방법으로 이용자에게 공지함으로써 효력을 발생합니다.</li>
            <li>운영자는 관련 법령에 위배되지 않는 범위 내에서 약관을 변경할 수 있으며, 변경 시 시행일 최소 7일 전에 공지합니다.</li>
            <li>변경된 약관에 동의하지 않는 이용자는 서비스 이용을 중단하고 회원 탈퇴할 수 있습니다.</li>
          </ol>
        </Section>

        <Section title="제4조 (회원가입)">
          <ol className="list-decimal space-y-1 pl-5">
            <li>이용자는 서비스가 정한 양식에 따라 회원 정보를 기입하고, 본 약관 및 개인정보처리방침에 동의함으로써 회원가입을 신청합니다.</li>
            <li>운영자는 다음 각 호에 해당하는 경우 회원가입을 거부할 수 있습니다.
              <ul className="mt-1 list-disc space-y-0.5 pl-5">
                <li>타인의 정보를 이용한 경우</li>
                <li>허위 정보를 기재한 경우</li>
                <li>기타 서비스 운영에 지장을 초래하는 경우</li>
              </ul>
            </li>
          </ol>
        </Section>

        <Section title="제5조 (회원 탈퇴 및 자격 제한)">
          <ol className="list-decimal space-y-1 pl-5">
            <li>회원은 언제든지 서비스 내에서 회원 탈퇴를 요청할 수 있으며, 운영자는 즉시 처리합니다.</li>
            <li>운영자는 다음 각 호에 해당하는 경우 회원 자격을 제한하거나 정지할 수 있습니다.
              <ul className="mt-1 list-disc space-y-0.5 pl-5">
                <li>타인의 서비스 이용을 방해하거나 정보를 도용한 경우</li>
                <li>법령 또는 본 약관에서 금지하는 행위를 한 경우</li>
                <li>공공질서 및 미풍양속에 반하는 행위를 한 경우</li>
              </ul>
            </li>
          </ol>
        </Section>

        <Section title="제6조 (이용자의 의무)">
          <p>이용자는 다음 행위를 하여서는 안 됩니다.</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-5">
            <li>타인의 개인정보를 무단으로 수집·저장·공개하는 행위</li>
            <li>서비스의 운영을 고의로 방해하는 행위</li>
            <li>욕설, 비방, 음란물, 광고성 게시물 등을 게시하는 행위</li>
            <li>법령에 위반되는 행위</li>
            <li>서비스를 영리 목적으로 무단 이용하는 행위</li>
          </ul>
        </Section>

        <Section title="제7조 (서비스의 제공 및 변경)">
          <ol className="list-decimal space-y-1 pl-5">
            <li>운영자는 커뮤니티 게시판 및 기타 운영자가 추가 개발하는 서비스를 제공합니다.</li>
            <li>운영자는 서비스의 내용을 변경하거나 중단할 수 있으며, 이 경우 사전에 공지합니다.</li>
          </ol>
        </Section>

        <Section title="제8조 (게시물의 관리)">
          <ol className="list-decimal space-y-1 pl-5">
            <li>이용자가 작성한 게시물의 저작권은 해당 이용자에게 있습니다.</li>
            <li>운영자는 법령에 위반되는 내용, 타인을 비방하는 내용, 음란·폭력적 내용, 광고성 게시물, 기타 운영 정책에 위반되는 게시물을 사전 통보 없이 삭제할 수 있습니다.</li>
          </ol>
        </Section>

        <Section title="제9조 (면책 조항)">
          <ol className="list-decimal space-y-1 pl-5">
            <li>운영자는 천재지변, 시스템 장애 등 불가항력으로 인해 서비스를 제공할 수 없는 경우 책임을 지지 않습니다.</li>
            <li>운영자는 이용자 간 또는 이용자와 제3자 간에 서비스를 매개로 발생한 분쟁에 대해 개입할 의무가 없으며, 이로 인한 손해를 배상할 책임이 없습니다.</li>
          </ol>
        </Section>

        <Section title="제10조 (분쟁 해결)">
          <ol className="list-decimal space-y-1 pl-5">
            <li>본 약관에 명시되지 않은 사항은 관련 법령 및 일반 상관례에 따릅니다.</li>
            <li>서비스 이용과 관련된 분쟁은 대한민국 법률을 준거법으로 하며, 관할 법원은 민사소송법에 따릅니다.</li>
          </ol>
        </Section>

        <p className="mt-8 border-t border-zinc-100 pt-4 text-xs text-zinc-400 dark:border-zinc-800">
          본 이용약관은 2026년 8월 7일부터 시행됩니다.
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
