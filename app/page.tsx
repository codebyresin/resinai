import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-zinc-50 font-sans dark:bg-black">
      <h1 className="text-2xl font-semibold">Resin AI 小助手</h1>
      <p className="text-zinc-600 dark:text-zinc-400">欢迎使用，请先登入。</p>
      <Link
        href="/login"
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
      >
        前往登入
      </Link>
    </div>
  );
}
