import { NextResponse } from "next/server";
import { z } from "zod";

const ContactSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    message: z.string().min(10),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const data = ContactSchema.parse(body);

        // TODO: Integrate email/provider here (Resend, SendGrid, etc.)
        console.log("contact.message", data);

        return NextResponse.json({ ok: true });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ ok: false, errors: error.flatten() }, { status: 422 });
        }
        return NextResponse.json({ ok: false }, { status: 500 });
    }
}



