import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { pool } from "@/lib/mysql";

interface VerifyCodeBody {
  email: string;
  code: string;
}

interface CodeRow {
  id: number;
  email: string;
  code: string;
  expires_at: Date;
  used: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as VerifyCodeBody;
    const email = body.email?.trim().toLowerCase();
    const code = body.code?.trim();

    if (!email || !code) {
      return NextResponse.json(
        { message: "邮箱和验证码不能为空。" },
        { status: 400 },
      );
    }

    const [rows] = await pool.execute<CodeRow[]>(
      `SELECT id, email, code, expires_at, used
       FROM email_login_codes
       WHERE email = ? AND code = ?
       ORDER BY id DESC
       LIMIT 1`,
      [email, code],
    );

    const record = rows[0];

    if (!record) {
      return NextResponse.json(
        { message: "验证码不正确。" },
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

    await pool.execute(`UPDATE email_login_codes SET used = 1 WHERE id = ?`, [
      record.id,
    ]);

    // TODO: 在这里设置登录态（Cookie / Session / JWT）
    return NextResponse.json(
      {
        message: "登录成功。",
        email,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Verify code error:", error);
    return NextResponse.json(
      { message: "验证失败，请稍后重试。" },
      { status: 500 },
    );
  }
}

