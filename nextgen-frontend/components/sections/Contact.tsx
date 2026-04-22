"use client";

import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import { submitContact } from "@/lib/api";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { GlowButton } from "@/components/ui/GlowButton";

type ContactProps = {
  standalone?: boolean;
};

const initialForm = {
  name: "",
  email: "",
  subject: "",
  message: ""
};

export function Contact({ standalone = false }: ContactProps) {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name || !form.email || !form.subject || !form.message) {
      toast.error("All fields are required.");
      return;
    }
    if (form.message.length < 20) {
      toast.error("Message must be at least 20 characters.");
      return;
    }

    setLoading(true);
    try {
      const response = await submitContact(form);
      if (response.success) {
        toast.success(response.message);
        setForm(initialForm);
      } else {
        toast.error("Submission failed. Please try again.");
      }
    } catch {
      toast.error("Unable to send message right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className={standalone ? "section-shell pt-6" : "section-shell"}>
      <SectionTitle title="Contact" subtitle="Let us discuss your next build." />
      <div className="glass-card grid gap-6 p-6 sm:p-8 md:grid-cols-2">
        <div>
          <h3 className="font-heading text-xl">Get in touch</h3>
          <p className="mt-4 text-sm text-textSecondary">
            hello@nextgenwebailabs.com
            <br />
            +91 XXXXX XXXXX
            <br />
            Alwar, Rajasthan, India
          </p>
        </div>
        <form className="space-y-3" onSubmit={handleSubmit}>
          <input
            className="w-full rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none transition focus:border-cyan-300/50"
            placeholder="Full Name"
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          />
          <input
            className="w-full rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none transition focus:border-cyan-300/50"
            placeholder="Email Address"
            type="email"
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
          />
          <input
            className="w-full rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none transition focus:border-cyan-300/50"
            placeholder="Subject"
            value={form.subject}
            onChange={(event) => setForm((prev) => ({ ...prev, subject: event.target.value }))}
          />
          <textarea
            className="w-full rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none transition focus:border-cyan-300/50"
            placeholder="Message"
            rows={4}
            value={form.message}
            onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
          />
          <GlowButton type="submit" disabled={loading} className="w-full">
            {loading ? "Sending..." : "Send Message"}
          </GlowButton>
        </form>
      </div>
    </section>
  );
}
