"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Github, Linkedin, Instagram, Twitter, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

const Schema = z.object({
    name: z.string().min(2, "Nama terlalu pendek"),
    email: z.string().email("Email tidak valid"),
    message: z.string().min(10, "Minimal 10 karakter"),
});
type Values = z.infer<typeof Schema>;

const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-20%" },
    transition: { duration: 0.6, delay },
});

export function Contact() {
    const form = useForm<Values>({
        resolver: zodResolver(Schema),
        defaultValues: { name: "", email: "", message: "" },
    });

    async function onSubmit(values: Values) {
        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });
            const data = await res.json();
            if (!res.ok || !data.ok) throw new Error("Failed");
            toast.success("Pesan terkirim! Saya akan menghubungi Anda kembali.");
            form.reset();
        } catch (e) {
            toast.error("Gagal mengirim pesan. Coba lagi nanti.");
        }
    }

    return (
        <section id="contact" className="section">
            <div className="container mx-auto px-4">
                <motion.h2 className="text-3xl md:text-4xl font-semibold tracking-tight" {...fadeUp(0)}>
                    Contact
                </motion.h2>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
                    {/* Left: socials */}
                    <motion.div {...fadeUp(0.06)}>
                        <div className="glass card-surface p-5">
                            <div className="space-y-3 text-sm">
                                <a className="flex items-center gap-2 hover:underline" href="https://github.com/" target="_blank" rel="noreferrer">
                                    <Github className="size-4" /> GitHub
                                </a>
                                <a className="flex items-center gap-2 hover:underline" href="https://www.linkedin.com/" target="_blank" rel="noreferrer">
                                    <Linkedin className="size-4" /> LinkedIn
                                </a>
                                <a className="flex items-center gap-2 hover:underline" href="https://www.instagram.com/" target="_blank" rel="noreferrer">
                                    <Instagram className="size-4" /> Instagram
                                </a>
                                <a className="flex items-center gap-2 hover:underline" href="https://dorahacks.io/" target="_blank" rel="noreferrer">
                                    <Globe className="size-4" /> DoraHacks
                                </a>
                                <a className="flex items-center gap-2 hover:underline" href="https://twitter.com/" target="_blank" rel="noreferrer">
                                    <Twitter className="size-4" /> Twitter
                                </a>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right: form */}
                    <motion.div {...fadeUp(0.12)}>
                        <div className="glass card-surface p-5">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Nama</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Nama Anda" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input type="email" placeholder="name@company.com" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="message"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Pesan</FormLabel>
                                                <FormControl>
                                                    <Textarea rows={6} placeholder="Ceritakan kebutuhan Anda..." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" className="button-radius brand-gradient">Kirim</Button>
                                </form>
                            </Form>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}


