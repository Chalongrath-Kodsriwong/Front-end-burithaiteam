import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount } = body;

    // ใส่ PromptPay key จาก env (เบอร์ 10 หลักขึ้นต้น 0 / บัตร 13 / eWallet 15)
    const payKey = (process.env.PROMPT_PAY_KEY || "").trim().replace(/\D/g, "");

    if (!payKey) {
      return NextResponse.json(
        { ok: false, message: "Missing PROMPT_PAY_KEY in Next env" },
        { status: 500 }
      );
    }

    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { ok: false, message: "Invalid amount" },
        { status: 400 }
      );
    }

    // ตาม doc: เลือก field ให้ถูกชนิด
    const identifier =
      payKey.length === 10 && payKey.startsWith("0")
        ? { msisdn: payKey }
        : payKey.length === 13
        ? { natId: payKey }
        : payKey.length === 15
        ? { eWalletId: payKey }
        : null;

    if (!identifier) {
      return NextResponse.json(
        { ok: false, message: "PROMPT_PAY_KEY must be 10/13/15 digits" },
        { status: 400 }
      );
    }

    const res = await fetch("https://bill-payment-api.easyslip.com/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "PROMPTPAY",
        ...identifier,
        amount,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { ok: false, message: data?.message || "EasySlip generate failed", data },
        { status: res.status }
      );
    }

    const qrDataUrl = `data:${data.mime};base64,${data.image_base64}`;

    return NextResponse.json({
      ok: true,
      qrDataUrl,
      payload: data.payload ?? null,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, message: e?.message || "Server error" },
      { status: 500 }
    );
  }
}
