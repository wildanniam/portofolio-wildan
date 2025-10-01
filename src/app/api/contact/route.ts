import { NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";

const ContactSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    message: z.string().min(10),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const data = ContactSchema.parse(body);

        const resendKey = process.env.RESEND_API_KEY;
        if (!resendKey) {
            return NextResponse.json({ ok: false, error: "Missing RESEND_API_KEY" }, { status: 500 });
        }

        const resend = new Resend(resendKey);
        await resend.emails.send({
            from: "Portfolio Contact <noreply@your-domain.com>",
            to: ["your-receiver@your-domain.com"],
            subject: `New contact from ${data.name}`,
            replyTo: data.email,
            text: data.message,
        });

        return NextResponse.json({ ok: true });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ ok: false, errors: error.flatten() }, { status: 422 });
        }
        return NextResponse.json({ ok: false }, { status: 500 });
    }
}



