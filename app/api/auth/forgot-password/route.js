import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

import { pool } from "@/lib/mysql";

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request) {
  try {
    const body = await request.json();
    const email = body.email?.trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ message: "邮箱不能为空。" }, { status: 400 });
    }

    const code = generateCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await pool.execute(
      `INSERT INTO password_reset_codes (email, code, expires_at, used)
       VALUES (?, ?, ?, 0)`,
      [email, code, expiresAt],
    );

    const transporter = nodemailer.createTransport({
      host: process.env.QQ_SMTP_HOST ?? "smtp.qq.com",
      port: Number(process.env.QQ_SMTP_PORT ?? 465),
      secure: true,
      auth: {
        user: process.env.QQ_EMAIL_USER,
        pass: process.env.QQ_EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Resin AI 重置密码" <${process.env.QQ_EMAIL_USER}>`,
      to: email,
      subject: "重置密码验证码",
      text: `您的重置密码验证码是：${code}，10 分钟内有效。`,
      html: `<p>您的重置密码验证码是：<b>${code}</b>，10 分钟内有效。</p>`,
    });

    return NextResponse.json({ message: "验证码已发送，请查收邮箱。" });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { message: "发送重置验证码失败，请稍后重试。" },
      { status: 500 },
    );
  }
}
