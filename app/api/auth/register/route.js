import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { pool } from "@/lib/mysql";

function isQqEmail(value) {
  const trimmed = String(value ?? "").trim().toLowerCase();
  return /^[1-9][0-9]{4,10}@qq\.com$/.test(trimmed);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const email = body.email?.trim().toLowerCase();
    const password = body.password;
    const code = body.code?.trim();

    if (!email || !password || !code) {
      return NextResponse.json(
        { message: "邮箱、密码和验证码均不能为空。" },
        { status: 400 },
      );
    }

    if (!isQqEmail(email)) {
      return NextResponse.json(
        { message: "仅支持 QQ 邮箱注册，例如 123456@qq.com。" },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "密码长度至少为 6 位。" },
        { status: 400 },
      );
    }

    const [existingUsers] = await pool.execute(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [email],
    );

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { message: "该邮箱已注册，请直接登录或找回密码。" },
        { status: 409 },
      );
    }

    const [codes] = await pool.execute(
      `SELECT id, email, code, expires_at, used
       FROM email_login_codes
       WHERE email = ? AND code = ?
       ORDER BY id DESC
       LIMIT 1`,
      [email, code],
    );

    const record = codes[0];

    if (!record) {
      return NextResponse.json(
        { message: "验证码不正确，请检查后重试。" },
        { status: 401 },
      );
    }

    if (record.used) {
      return NextResponse.json(
        { message: "验证码已使用，请重新获取。" },
        { status: 401 },
      );
    }

    if (new Date(record.expires_at) < new Date()) {
      return NextResponse.json(
        { message: "验证码已过期，请重新获取。" },
        { status: 401 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await pool.execute(
      "INSERT INTO users (email, password_hash) VALUES (?, ?)",
      [email, passwordHash],
    );

    await pool.execute(
      "UPDATE email_login_codes SET used = 1 WHERE id = ?",
      [record.id],
    );

    return NextResponse.json(
      { message: "注册成功，请使用 QQ 邮箱和密码登录。" },
      { status: 201 },
    );
  } catch (error) {
    console.error("Auth register error:", error);
    return NextResponse.json(
      { message: "注册失败，服务器异常，请稍后重试。" },
      { status: 500 },
    );
  }
}

