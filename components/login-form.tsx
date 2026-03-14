/**
 * 登录 / 注册表单。
 *
 * - QQ 邮箱 + 密码登录
 * - QQ 邮箱 + 验证码注册
 * - “记住邮箱”功能（localStorage）
 */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { cn } from "@/lib/utils";
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
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type LoginFormProps = React.ComponentProps<"div">;

interface ApiMessageResponse {
  message: string;
}

type ActiveTab = "login" | "register";

const REMEMBER_KEY_EMAIL = "resinai_login_email";
const REMEMBER_KEY_FLAG = "resinai_login_remember";

/**
 * 验证是否为 QQ 邮箱。
 */
function isQqEmail(value: string): boolean {
  const trimmed = value.trim().toLowerCase();
  return /^[1-9][0-9]{4,10}@qq\.com$/.test(trimmed);
}

export function LoginForm({ className, ...props }: LoginFormProps) {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<ActiveTab>("login");

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [registerCode, setRegisterCode] = useState<string>("");

  const [rememberEmail, setRememberEmail] = useState<boolean>(true);

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [sendingRegisterCode, setSendingRegisterCode] = useState<boolean>(false);
  const [registerCodeCountdown, setRegisterCodeCountdown] = useState<number>(0);

  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    try {
      const rememberFlag = localStorage.getItem(REMEMBER_KEY_FLAG);
      const savedEmail = localStorage.getItem(REMEMBER_KEY_EMAIL);
      if (rememberFlag === "1" && savedEmail) {
        setRememberEmail(true);
        setEmail(savedEmail);
      }
    } catch {
      // [Design] localStorage 访问异常时静默失败
    }
  }, []);

  useEffect(() => {
    if (!registerCodeCountdown) return;
    const timer = window.setInterval(() => {
      setRegisterCodeCountdown((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [registerCodeCountdown]);

  function rememberEmailIfNeeded(currentEmail: string, enabled: boolean) {
    try {
      if (enabled) {
        localStorage.setItem(REMEMBER_KEY_EMAIL, currentEmail);
        localStorage.setItem(REMEMBER_KEY_FLAG, "1");
      } else {
        localStorage.removeItem(REMEMBER_KEY_EMAIL);
        localStorage.removeItem(REMEMBER_KEY_FLAG);
      }
    } catch {
      // [Design] 非关键逻辑，失败时忽略
    }
  }

  async function handleLoginSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setInfo(null);

    const trimmedEmail = email.trim().toLowerCase();
    if (!isQqEmail(trimmedEmail)) {
      setError("请输入有效的 QQ 邮箱地址，例如 123456@qq.com。");
      return;
    }
    if (!password) {
      setError("密码不能为空。");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: trimmedEmail,
          password,
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | ApiMessageResponse
        | null;

      if (!response.ok) {
        setError(data?.message ?? "登录失败，请检查邮箱或密码。");
        return;
      }

      rememberEmailIfNeeded(trimmedEmail, rememberEmail);
      router.push("/");
    } catch {
      setError("网络异常，请稍后重试。");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSendRegisterCode() {
    setError(null);
    setInfo(null);

    const trimmedEmail = email.trim().toLowerCase();
    if (!isQqEmail(trimmedEmail)) {
      setError("请输入有效的 QQ 邮箱地址，例如 123456@qq.com。");
      return;
    }

    setSendingRegisterCode(true);
    try {
      const response = await fetch("/api/auth/send-code", {
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

      setInfo(data?.message ?? "验证码已发送，请在 5 分钟内完成注册。");
      setRegisterCodeCountdown(60);
    } catch {
      setError("发送验证码失败，请检查网络后重试。");
    } finally {
      setSendingRegisterCode(false);
    }
  }

  async function handleRegisterSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setInfo(null);

    const trimmedEmail = email.trim().toLowerCase();
    if (!isQqEmail(trimmedEmail)) {
      setError("请输入有效的 QQ 邮箱地址，例如 123456@qq.com。");
      return;
    }
    if (!password || !confirmPassword) {
      setError("密码和确认密码不能为空。");
      return;
    }
    if (password !== confirmPassword) {
      setError("两次输入的密码不一致。");
      return;
    }
    if (password.length < 6) {
      setError("密码长度至少为 6 位。");
      return;
    }
    if (!registerCode.trim()) {
      setError("请先获取并填写邮箱验证码。");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: trimmedEmail,
          password,
          code: registerCode.trim(),
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | ApiMessageResponse
        | null;

      if (!response.ok) {
        setError(data?.message ?? "注册失败，请稍后重试。");
        return;
      }

      setInfo(data?.message ?? "注册成功，请使用该账号登录。");
      setActiveTab("login");
      setRegisterCode("");
      setConfirmPassword("");
    } catch {
      setError("注册失败，请稍后重试。");
    } finally {
      setSubmitting(false);
    }
  }

  const isLogin = activeTab === "login";

  return (
    <div className={cn("flex flex-col gap-4", className)} {...props}>
      <Card>
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-xl">
            {isLogin ? "登录 Resin AI 账号" : "注册 Resin AI 账号"}
          </CardTitle>
          <CardDescription>
            使用 QQ 邮箱登录，体验流式 AI 对话与多模态能力。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex rounded-md bg-muted p-1 text-sm">
            <button
              type="button"
              onClick={() => {
                setActiveTab("login");
                setError(null);
                setInfo(null);
              }}
              className={cn(
                "flex-1 rounded-sm px-3 py-1.5 transition",
                isLogin
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground",
              )}
            >
              登录
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("register");
                setError(null);
                setInfo(null);
              }}
              className={cn(
                "flex-1 rounded-sm px-3 py-1.5 transition",
                !isLogin
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground",
              )}
            >
              注册
            </button>
          </div>

          {isLogin ? (
            <form onSubmit={handleLoginSubmit}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="login-email">QQ 邮箱</FieldLabel>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="123456@qq.com"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="login-password">密码</FieldLabel>
                  <Input
                    id="login-password"
                    type="password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                </Field>
                <Field className="flex items-center justify-between gap-2">
                  <label className="flex items-center gap-2 text-xs text-muted-foreground">
                    <input
                      type="checkbox"
                      className="size-3 accent-primary"
                      checked={rememberEmail}
                      onChange={(event) =>
                        setRememberEmail(event.target.checked)
                      }
                    />
                    <span>记住邮箱（下次自动填充）</span>
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs underline-offset-4 hover:underline"
                  >
                    忘记密码？
                  </Link>
                </Field>
                <Field>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={submitting}
                  >
                    {submitting ? "登录中..." : "登录"}
                  </Button>
                </Field>
              </FieldGroup>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="register-email">QQ 邮箱</FieldLabel>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="123456@qq.com"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="register-code">邮箱验证码</FieldLabel>
                  <div className="flex gap-2">
                    <Input
                      id="register-code"
                      type="text"
                      placeholder="请输入 6 位验证码"
                      required
                      value={registerCode}
                      onChange={(event) => setRegisterCode(event.target.value)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="whitespace-nowrap"
                      disabled={sendingRegisterCode || registerCodeCountdown > 0}
                      onClick={handleSendRegisterCode}
                    >
                      {registerCodeCountdown > 0
                        ? `重新获取 (${registerCodeCountdown}s)`
                        : sendingRegisterCode
                        ? "发送中..."
                        : "获取验证码"}
                    </Button>
                  </div>
                  <FieldDescription>
                    验证码将通过 QQ 邮箱发送，5 分钟内有效。
                  </FieldDescription>
                </Field>
                <Field>
                  <FieldLabel htmlFor="register-password">密码</FieldLabel>
                  <Input
                    id="register-password"
                    type="password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="register-confirm-password">
                    确认密码
                  </FieldLabel>
                  <Input
                    id="register-confirm-password"
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
                    {submitting ? "注册中..." : "注册并登录"}
                  </Button>
                  <FieldDescription className="text-center">
                    注册即表示你同意我们的服务条款和隐私政策。
                  </FieldDescription>
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
      <FieldDescription className="px-6 text-center text-xs text-muted-foreground">
        登录完成后即可开始使用 Resin AI 进行对话与多模态创作。
      </FieldDescription>
    </div>
  );
}
