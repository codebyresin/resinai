/**
 * 登录 / 注册页面。
 *
 * 使用 QQ 邮箱登录 Resin AI。
 */
"use client";

import Link from "next/link";
import { GalleryVerticalEndIcon } from "lucide-react";

import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          href="/"
          className="flex items-center gap-2 self-center font-medium"
        >
          <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GalleryVerticalEndIcon className="size-4" />
          </div>
          Resin AI 小助手
        </Link>

        <LoginForm />
      </div>
    </div>
  );
}

