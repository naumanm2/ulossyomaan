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
    <div className="relative flex justify-center items-center min-h-screen bg-[url(/bg.png)] bg-size-[30%_30%] z-10">
      <div className="relative flex flex-col m-4 h-[96vh] border-4 border-foreground shadow-md w-full max-w-4xl  bg-white box-content">
        {/* Header */}

        <div className="absolute top-0 w-full px-4 pt-6 pb-4 mx-auto overflow-visible bg-gradient-to-b from-white to-transparent">
          {/* <button className="flex flex-col items-center gap-1 text-foreground">
          <Menu className="w-8 h-8" strokeWidth={2.5} />
          <span className="text-xs font-bold tracking-wide">MENU</span>
        </button> */}
          <div className="flex-1 flex flex-col items-center -mt-2">
            <Image
              src="/muutos.png"
              alt="Logo"
              width={240}
              height={40}
              loading="eager"
            />
          </div>
          {/* <div className="w-8" /> Spacer for centering */}
        </div>

        {/* Messages Container */}

        <div className="flex-1 h-full overflow-y-scroll pt-40 px-4 py-6 space-y-6 max-w-5xl w-full mx-auto">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-2">
                <div className="">
                  <strong className="text-foreground text-md">
                    Hei! Olen AI-pohjainen sparrailukumppanisi.
                  </strong>
                </div>
                <div className="">
                  <p className="text-muted-foreground text-md max-w-md">
                    Autan sinua käyttämään Ulos syömään -strategiaa eduksesi.
                    <br /> Kerro aluksi, kuka olet ja mitä teet niin osaan
                    auttaa juuri sinulle relevanteissa asioissa.
                  </p>
                </div>
                {/* <ul className="list-disc list-inside space-y-0.5">
                  <li className="text-muted-foreground">
                    "Miten voin parantaa tiimityötäni?"
                  </li>
                  <li className="text-muted-foreground">
                    "Miten käsitellä vaikeita asiakastilanteita?"
                  </li>
                  <li className="text-muted-foreground">
                    "Miten voin kehittää johtamistaitojani?"
                  </li>
                </ul> */}
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

        <div className="bg-white pb-4 pt-4 px-4 self-end w-full rounded-b-4xl box-border">
          <form
            onSubmit={handleSubmit}
            className="max-w-5xl flex flex-row mx-auto border-ring focus-within:ring-ring-active focus-within:ring-offset-background origin-left bg-secondary outline-offset-2 transition-all duration-500 ease-in-out focus-within:ring-2 focus-within:ring-offset-2 pr-2 items-center gap-3"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isLoading ? "Odota..." : "Kirjoita viestisi..."}
              disabled={isLoading}
              className="focus:outline-0 shadow-none flex-1 h-14 text-base border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-6"
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              size="icon"
              className="h-10 w-10 rounded-none bg-primary hover:bg-primary/90 text-white flex-shrink-0"
            >
              <ArrowUp className="w-6 h-6" />
            </Button>
          </form>
        </div>
        <div className="fixed -z-10 md:-right-0 -right-12 -bottom-12 md:-bottom-0">
          <Image
            src="/suu.png"
            alt="Logo"
            width={240}
            height={40}
            loading="eager"
          />
        </div>
        <div className="fixed -z-10 md:-left-0 -left-12 -top-12 md:-top-0">
          <Image
            src="/lasi.png"
            alt="Logo"
            width={240}
            height={40}
            loading="eager"
          />
        </div>
      </div>
    </div>
  );
}
