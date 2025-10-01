import { Metadata } from "next";
import { ContactForm } from "@/components/projects/contact-form";

export const metadata: Metadata = {
    title: "Contact — Wildan Syukri Niam",
};

export default function ContactPage() {
    return (
        <main className="container mx-auto px-4 py-12">
            <h1 className="text-3xl font-semibold tracking-tight">Get in touch</h1>
            <p className="text-muted-foreground mt-2">Let’s build something great together.</p>
            <div className="mt-8">
                <ContactForm />
            </div>
        </main>
    );
}



