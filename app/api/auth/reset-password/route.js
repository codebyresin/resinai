import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { pool } from "@/lib/mysql";

export async function POST(request) {
  try {
    const body = await request.json();
    const email = body.email?.trim().toLowerCase();
    const code = body.code?.trim();
    const newPassword = body.newPassword;

    if (!email || !code || !newPassword) {
      return NextResponse.json(
        { message: "邮箱、验证码和新密码不能为空。" },
        { status: 400 },
      );
    }

    const [rows] = await pool.execute(
      `SELECT id, email, code, expires_at, used
       FROM password_reset_codes
       WHERE email = ? AND code = ?
       ORDER BY id DESC
       LIMIT 1`,
      [email, code],
    );

    const record = rows[0];

    if (!record) {
      return NextResponse.json({ message: "验证码不正确。" }, { status: 401 });
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

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await pool.execute(`UPDATE users SET password_hash = ? WHERE email = ?`, [
      passwordHash,
      email,
    ]);

    await pool.execute(
      `UPDATE password_reset_codes SET used = 1 WHERE id = ?`,
      [record.id],
    );

    return NextResponse.json(
      { message: "密码已重置，请使用新密码登录。" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { message: "重置密码失败，请稍后重试。" },
      { status: 500 },
    );
  }
}
