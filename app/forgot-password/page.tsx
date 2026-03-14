/**
 * 忘记密码页面。
 *
 * - 第一步：输入 QQ 邮箱，发送重置验证码到邮箱
 * - 第二步：输入邮箱、验证码和新密码，完成密码重置
 */
"use client";

import { useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

interface ApiMessageResponse {
  message: string;
}

/**
 * 验证是否为 QQ 邮箱。
 */
function isQqEmail(value: string): boolean {
  const trimmed = value.trim().toLowerCase();
  return /^[1-9][0-9]{4,10}@qq\.com$/.test(trimmed);
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const [step, setStep] = useState<1 | 2>(1);
  const [sending, setSending] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function handleSendCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setInfo(null);

    const trimmedEmail = email.trim().toLowerCase();
    if (!isQqEmail(trimmedEmail)) {
      setError("请输入有效的 QQ 邮箱地址，例如 123456@qq.com。");
      return;
    }

    setSending(true);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: trimmedEmail }),
      });

      const data = (await response.json().catch(() => null)) as
        | ApiMessageResponse
        | null;

      if (!response.ok) {
        setError(data?.message ?? "发送验证码失败，请稍后重试。");
        return;
      }

      setInfo(data?.message ?? "验证码已发送，请查收邮箱。");
      setStep(2);
    } catch {
      setError("发送验证码失败，请检查网络后重试。");
    } finally {
      setSending(false);
    }
  }

  async function handleResetPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setInfo(null);

    const trimmedEmail = email.trim().toLowerCase();
    if (!isQqEmail(trimmedEmail)) {
      setError("请输入有效的 QQ 邮箱地址，例如 123456@qq.com。");
      return;
    }
    if (!code.trim()) {
      setError("请输入邮箱验证码。");
      return;
    }
    if (!newPassword || !confirmPassword) {
      setError("新密码和确认密码不能为空。");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("两次输入的新密码不一致。");
      return;
    }
    if (newPassword.length < 6) {
      setError("新密码长度至少为 6 位。");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: trimmedEmail,
          code: code.trim(),
          newPassword,
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | ApiMessageResponse
        | null;

      if (!response.ok) {
        setError(data?.message ?? "重置密码失败，请稍后重试。");
        return;
      }

      setInfo(data?.message ?? "密码已重置，请返回登录页使用新密码登录。");
    } catch {
      setError("重置密码失败，请稍后重试。");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          href="/login"
          className="self-start text-xs text-muted-foreground underline-offset-4 hover:underline"
        >
          ← 返回登录
        </Link>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">重置密码</CardTitle>
            <CardDescription>
              使用绑定的 QQ 邮箱接收验证码，完成密码重置。
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 1 ? (
              <form onSubmit={handleSendCode}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="forgot-email">QQ 邮箱</FieldLabel>
                    <Input
                      id="forgot-email"
                      type="email"
                      placeholder="123456@qq.com"
                      required
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                    />
                    <FieldDescription>
                      我们会向该邮箱发送 6 位数字验证码。
                    </FieldDescription>
                  </Field>
                  <Field>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={sending}
                    >
                      {sending ? "发送中..." : "发送验证码"}
                    </Button>
                  </Field>
                </FieldGroup>
              </form>
            ) : (
              <form onSubmit={handleResetPassword}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="forgot-email">QQ 邮箱</FieldLabel>
                    <Input
                      id="forgot-email"
                      type="email"
                      required
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                    />
                    <FieldDescription>
                      请保持与第一步输入的邮箱一致。
                    </FieldDescription>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="forgot-code">邮箱验证码</FieldLabel>
                    <Input
                      id="forgot-code"
                      type="text"
                      placeholder="请输入邮箱中的 6 位验证码"
                      required
                      value={code}
                      onChange={(event) => setCode(event.target.value)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="forgot-new-password">
                      新密码
                    </FieldLabel>
                    <Input
                      id="forgot-new-password"
                      type="password"
                      required
                      value={newPassword}
                      onChange={(event) =>
                        setNewPassword(event.target.value)
                      }
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="forgot-confirm-password">
                      确认新密码
                    </FieldLabel>
                    <Input
                      id="forgot-confirm-password"
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(event.target.value)
                      }
                    />
                  </Field>
                  <Field>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={submitting}
                    >
                      {submitting ? "提交中..." : "确认重置密码"}
                    </Button>
                  </Field>
                </FieldGroup>
              </form>
            )}

            {(error || info) && (
              <div className="mt-4 space-y-1 text-center text-sm">
                {error ? (
                  <p className="text-red-500">{error}</p>
                ) : null}
                {info ? (
                  <p className="text-emerald-600">{info}</p>
                ) : null}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

