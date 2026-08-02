"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Send, Bot, Key, Loader2 } from "lucide-react";
import { EXAMS_2026, getExamDisplayName } from "@/data/exams";

const KEY_STORAGE = "study-planner-openai-key";

type Message = { role: "user" | "assistant" | "system"; content: string };

function AIContent() {
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm your personal study tutor for the 2026 exams. Ask me to explain concepts, make detailed revision plans, create practice questions, or give exam tips. Add your OpenAI API key below (stored only on this device).",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [showKeyInput, setShowKeyInput] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const autoSent = useRef(false);

  useEffect(() => {
    const saved = localStorage.getItem(KEY_STORAGE) || "";
    setApiKey(saved);
    if (!saved) setShowKeyInput(true);
  }, []);

  // Pre-fill from calendar "Get detailed AI plan" buttons
  useEffect(() => {
    const prompt = searchParams.get("prompt");
    if (prompt && !autoSent.current) {
      setInput(decodeURIComponent(prompt));
      autoSent.current = true;
    }
  }, [searchParams]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const saveKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem(KEY_STORAGE, key);
    if (key) setShowKeyInput(false);
  };

  const send = async () => {
    if (!input.trim() || loading) return;
    if (!apiKey) {
      setShowKeyInput(true);
      return;
    }

    const userMsg = input.trim();
    setInput("");
    setMessages((m) => [...m, { role: "user", content: userMsg }]);
    setLoading(true);

    const examContext = EXAMS_2026.slice(0, 15)
      .map((e) => `- ${getExamDisplayName(e)} on ${e.date}`)
      .join("\n");

    const systemPrompt = `You are an expert South African Grade 12 study coach preparing learners for the 2026 NSC exams. Be clear, structured, practical and encouraging.

When creating study plans:
- Give day-by-day breakdowns
- Name specific past-paper style tasks (e.g. "Complete 2023 P1 Questions 3–5 under timed conditions, then mark with the memo")
- Include exact topics that commonly appear in NSC and prelim papers
- Suggest realistic times
- Include recovery/lighter days
- Never give vague advice like "revise the chapter" – always say exactly what to do

Upcoming exams include:
${examContext}`;

    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages
              .filter((m) => m.role !== "system")
              .slice(-6)
              .map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: userMsg },
          ],
          temperature: 0.65,
          max_tokens: 1200,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || `API error ${res.status}`);
      }

      const data = await res.json();
      const reply =
        data.choices?.[0]?.message?.content ||
        "Sorry, I couldn't generate a reply.";

      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch (err: any) {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: `Error: ${err.message || "Something went wrong"}. Check that your OpenAI API key is correct and has credits.`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-3xl flex-col">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Tutor</h1>
          <p className="mt-1 text-slate-400">
            Detailed plans, explanations and past-paper style practice
          </p>
        </div>
        <button
          onClick={() => setShowKeyInput(!showKeyInput)}
          className="flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800"
        >
          <Key className="h-3.5 w-3.5" />
          {apiKey ? "Key set" : "Add API Key"}
        </button>
      </div>

      {showKeyInput && (
        <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
          <p className="text-sm text-amber-200 mb-2">
            Paste your OpenAI API key. It stays only on this device.
          </p>
          <div className="flex gap-2">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
            />
            <button
              onClick={() => saveKey(apiKey)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-500"
            >
              Save
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Get a key at platform.openai.com → API keys (gpt-4o-mini is cheap and good)
          </p>
        </div>
      )}

      <div className="flex-1 space-y-4 overflow-y-auto rounded-xl border border-slate-800 bg-slate-900/40 p-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.role === "assistant" && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600/20">
                <Bot className="h-4 w-4 text-blue-400" />
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-800 text-slate-200"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600/20">
              <Bot className="h-4 w-4 text-blue-400" />
            </div>
            <div className="flex items-center gap-2 rounded-2xl bg-slate-800 px-4 py-2.5 text-sm text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              Thinking…
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="mt-4 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
          placeholder="Ask for a detailed plan or explanation…"
          className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm outline-none focus:border-blue-500"
          disabled={loading}
        />
        <button
          onClick={send}
          disabled={loading || !input.trim()}
          className="rounded-xl bg-blue-600 px-4 py-3 text-white hover:bg-blue-500 disabled:opacity-50"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

export default function AIPage() {
  return (
    <Suspense fallback={<div className="text-slate-400 p-8">Loading AI Tutor…</div>}>
      <AIContent />
    </Suspense>
  );
}
