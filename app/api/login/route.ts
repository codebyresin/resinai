import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { pool } from "@/lib/mysql";

interface LoginBody {
  email: string;
  password: string;
}

interface DbUserRow {
  id: number;
  email: string;
  password_hash: string;
}

/**
 * 使用邮箱与密码进行登录校验的接口。
 *
 * - 路径：POST /api/login
 * - 请求体：{ email: string; password: string }
 * - 行为：对比数据库中加盐哈希后的密码，返回登录结果。
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as LoginBody;
    const email = body.email?.trim().toLowerCase();
    const password = body.password;

    if (!email || !password) {
      return NextResponse.json(
        { message: "邮箱和密码不能为空。" },
        { status: 400 },
      );
    }

    const [rows] = await pool.execute<DbUserRow[]>(
      "SELECT id, email, password_hash FROM users WHERE email = ? LIMIT 1",
      [email],
    );

    const user = rows[0];

    if (!user) {
      return NextResponse.json(
        { message: "邮箱或密码错误。" },
        { status: 401 },
      );
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password_hash,
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "邮箱或密码错误。" },
        { status: 401 },
      );
    }

    // TODO: 这里可以设置 Cookie / Session / JWT 等，当前先返回基础信息
    return NextResponse.json(
      {
        message: "登录成功。",
        user: {
          id: user.id,
          email: user.email,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    // [Warning] 为避免泄露内部错误细节，仅返回通用错误信息
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "服务器异常，请稍后重试。" },
      { status: 500 },
    );
  }
}

