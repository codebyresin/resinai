import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { pool } from "@/lib/mysql";

export async function POST(request) {
  try {
    const body = await request.json();
    const email = body.email?.trim().toLowerCase();
    const password = body.password;

    if (!email || !password) {
      return NextResponse.json(
        { message: "邮箱和密码不能为空。" },
        { status: 400 },
      );
    }

    const [rows] = await pool.execute(
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
    console.error("Auth login error:", error);
    return NextResponse.json(
      { message: "服务器异常，请稍后重试。" },
      { status: 500 },
    );
  }
}
