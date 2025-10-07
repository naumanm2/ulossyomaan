"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { ArrowUp, Loader2, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import Image from "next/image";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/openai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input.trim() }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen mx-auto">
      <div className="flex items-start justify-between px-4 pt-6 pb-4 fixed w-full overflow-visible bg-gradient-to-b from-white to-transparent">
        {/* <button className="flex flex-col items-center gap-1 text-foreground">
          <Menu className="w-8 h-8" strokeWidth={2.5} />
          <span className="text-xs font-bold tracking-wide">MENU</span>
        </button> */}
        <div className="flex-1 flex flex-col items-center -mt-2">
          <Image src="/muutos.png" alt="Logo" width={240} height={40} />
        </div>
        {/* <div className="w-8" /> Spacer for centering */}
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-scroll min-h-min pb-24 pt-40 px-4 py-6 space-y-6 max-w-5xl flex flex-col justify-end w-full mx-auto">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-3">
              <p className="text-muted-foreground text-lg">Aloita keskustelu</p>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {message.role === "user" ? (
              <div className="max-w-[75%] rounded-4xl px-5 py-3 bg-primary text-white">
                <p className="text-base leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </p>
              </div>
            ) : (
              <div className="max-w-[85%]">
                <p className="text-base leading-relaxed whitespace-pre-wrap text-foreground">
                  {message.content}
                </p>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="text-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white pb-6 pt-4 px-4 fixed w-full bottom-0 left-0 right-0">
        <form
          onSubmit={handleSubmit}
          className="max-w-5xl flex flex-row mx-auto border-ring focus-within:ring-ring-active focus-within:ring-offset-background origin-left rounded-full bg-secondary outline-offset-2 transition-all duration-500 ease-in-out focus-within:ring-2 focus-within:ring-offset-2 pr-4 items-center gap-3"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isLoading ? "Odota..." : "Kirjoita viestisi..."}
            disabled={isLoading}
            className="focus:outline-0 shadow-none flex-1 h-14 text-base rounded-full border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-6"
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            size="icon"
            className="h-8 w-8 rounded-full bg-primary hover:bg-primary/90 text-white flex-shrink-0"
          >
            <ArrowUp className="w-6 h-6" />
          </Button>
        </form>
      </div>
    </div>
  );
}
