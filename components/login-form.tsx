 "use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type LoginFormProps = React.ComponentProps<"div">;

export function LoginForm({ className, ...props }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState<string>(""); // 邮箱输入值
  const [password, setPassword] = useState<string>(""); // 密码输入值（密码登录）
  const [code, setCode] = useState<string>(""); // 验证码输入值（邮箱验证码登录）
  const [loadingPassword, setLoadingPassword] = useState<boolean>(false); // 密码登录加载状态
  const [loadingCode, setLoadingCode] = useState<boolean>(false); // 验证码登录加载状态
  const [sendingCode, setSendingCode] = useState<boolean>(false); // 发送验证码按钮加载状态
  const [error, setError] = useState<string | null>(null); // 错误信息
  const [info, setInfo] = useState<string | null>(null); // 成功提示信息（如验证码已发送）

  async function handlePasswordLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); // 阻止表单默认刷新行为（密码登录）
    setError(null); // 清空之前的错误
    setInfo(null); // 清空提示信息
    setLoadingPassword(true); // 开始密码登录加载
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.message ?? "登录失败，请检查邮箱或密码。");
        return;
      }

      // 登录成功，这里先简单跳转到首页或 dashboard
      router.push("/"); // TODO: 后续可以改为 /dashboard 等业务首页
    } catch (err) {
      setError("网络异常，请稍后重试。");
    } finally {
      setLoadingPassword(false); // 结束密码登录加载
    }
  }

  async function handleSendCode() {
    if (!email) {
      setError("请先输入邮箱，再获取验证码。");
      return;
    }
    setError(null); // 清空错误
    setInfo(null); // 清空提示
    setSendingCode(true); // 开始发送验证码加载
    try {
      const response = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        setError(data?.message ?? "发送验证码失败，请稍后重试。");
        return;
      }

      setInfo(data?.message ?? "验证码已发送，请查收邮箱。");
    } catch (err) {
      setError("发送验证码失败，请检查网络后重试。");
    } finally {
      setSendingCode(false); // 结束发送验证码加载
    }
  }

  async function handleCodeLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); // 阻止验证码登录表单默认行为
    setError(null);
    setInfo(null);
    setLoadingCode(true); // 开始验证码登录加载
    try {
      const response = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        setError(data?.message ?? "验证码登录失败，请重试。");
        return;
      }

      // 验证码登录成功
      setInfo(data?.message ?? "登录成功。");
      router.push("/");
    } catch (err) {
      setError("验证码登录失败，请稍后重试。");
    } finally {
      setLoadingCode(false); // 结束验证码登录加载
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>
            Login with your Apple or Google account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordLogin}>
            <FieldGroup>
              <Field>
                <Button variant="outline" type="button">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
                      fill="currentColor"
                    />
                  </svg>
                  Login with Apple
                </Button>
                <Button variant="outline" type="button">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  Login with Google
                </Button>
              </Field>
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Or continue with
              </FieldSeparator>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </Field>
              <Field>
                <Button type="submit" disabled={loadingPassword}>
                  {loadingPassword ? "Logging in..." : "密码登录"}
                </Button>
                <FieldDescription className="text-center">
                  Don&apos;t have an account? <a href="#">Sign up</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>

          <div className="mt-6 border-t pt-6">
            <form onSubmit={handleCodeLogin} className="space-y-4">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="code-email">Email（邮箱验证码登录）</FieldLabel>
                  <Input
                    id="code-email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </Field>
                <Field>
                  <div className="flex gap-2">
                    <Input
                      id="code"
                      type="text"
                      placeholder="输入 6 位验证码"
                      required
                      value={code}
                      onChange={(event) => setCode(event.target.value)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleSendCode}
                      disabled={sendingCode}
                    >
                      {sendingCode ? "发送中..." : "获取验证码"}
                    </Button>
                  </div>
                </Field>
                <Field>
                  <Button type="submit" disabled={loadingCode}>
                    {loadingCode ? "登录中..." : "验证码登录"}
                  </Button>
                </Field>
              </FieldGroup>
            </form>
          </div>

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
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  );
}
