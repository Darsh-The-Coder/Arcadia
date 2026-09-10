import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Users, Gamepad2, Video, Send, ArrowLeft, Sparkles, MessageSquare, Compass } from "lucide-react";

interface Message {
  sender: string;
  text: string;
  time: string;
}

const CONTACTS = [
  { name: "Anaya", status: "Online", avatar: "A" },
  { name: "Rohan", status: "Away", avatar: "R" },
  { name: "Meera", status: "Offline", avatar: "M" },
  { name: "College Yuvraj", status: "Offline", avatar: "C" },
];

function FamilyPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"chat" | "games">("chat");
  const [selectedContact, setSelectedContact] = useState("Anaya");
  const [messages, setMessages] = useState<Message[]>([
    { sender: "Anaya", text: "Juley! Shall we explore some traditional Northeast heritage games today?", time: "10:38 AM" },
  ]);
  const [inputMessage, setInputMessage] = useState("");

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    setMessages((prev) => [
      ...prev,
      { sender: "You", text: inputMessage, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
    ]);
    setInputMessage("");
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-5 py-8">
      {/* Top Bar / Back */}
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => void navigate({ to: "/activities" })}
          className="flex size-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground shadow-soft transition-transform hover:scale-105"
          aria-label="Back"
        >
          <ArrowLeft className="size-5" />
        </button>
      </div>

      {/* Header Section */}
      <header className="mb-4">
        <h1 className="text-3xl font-bold tracking-tight">Play with Friends</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Stay connected. Chat, invite and enjoy gentle games celebrating Northeast culture together.
        </p>
      </header>

      {/* Demo Banner */}
      <div className="mb-6 flex items-center gap-2 rounded-xl bg-card border border-border px-4 py-2.5 text-xs text-muted-foreground shadow-soft">
        <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>Demo mode — live sync with {selectedContact} enabled</span>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 rounded-full bg-card p-1.5 border border-border shadow-soft w-fit">
        <button
          type="button"
          onClick={() => setActiveTab("chat")}
          className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-all ${
            activeTab === "chat" ? "bg-sun text-sun-foreground shadow-soft" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Users className="size-4" /> Friends & Chat
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("games")}
          className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-all ${
            activeTab === "games" ? "bg-sun text-sun-foreground shadow-soft" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Gamepad2 className="size-4" /> Multiplayer Games
        </button>
      </div>

      {activeTab === "chat" ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Contacts Sidebar */}
          <div className="flex flex-col gap-2 rounded-3xl border border-border bg-card p-4 shadow-soft">
            <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Find a friend
            </div>
            {CONTACTS.map((contact) => (
              <button
                key={contact.name}
                type="button"
                onClick={() => setSelectedContact(contact.name)}
                className={`flex items-center gap-3 rounded-2xl p-3 text-left transition-all ${
                  selectedContact === contact.name ? "bg-sun/20 border border-sun/40 font-semibold" : "hover:bg-muted/50"
                }`}
              >
                <div className="flex size-10 items-center justify-center rounded-xl bg-sun/30 text-sun-foreground font-bold">
                  {contact.avatar}
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="truncate text-sm font-bold">{contact.name}</div>
                  <div className="text-xs text-muted-foreground">{contact.status}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Chat Window */}
          <div className="flex flex-col justify-between rounded-3xl border border-border bg-card p-6 shadow-soft md:col-span-2 min-h-[420px]">
            {/* Chat Header */}
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-sun/20 font-bold text-sun-foreground">
                  {selectedContact[0]}
                </div>
                <div>
                  <h2 className="font-bold">{selectedContact}</h2>
                  <p className="text-xs text-muted-foreground">Ready for cultural heritage games</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => alert(`Calling ${selectedContact} via secure line...`)}
                  className="flex items-center gap-1.5 rounded-full bg-secondary px-3.5 py-1.5 text-xs font-semibold shadow-soft hover:scale-105 transition-transform text-red-500 bg-red-50 border border-red-100"
                >
                  <Video className="size-3.5" /> Video Call
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("games")}
                  className="flex items-center gap-1.5 rounded-full bg-sun px-3.5 py-1.5 text-xs font-semibold text-sun-foreground shadow-soft hover:scale-105 transition-transform"
                >
                  <Gamepad2 className="size-3.5" /> Play a game
                </button>
              </div>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 space-y-4 py-4 overflow-y-auto max-h-[260px]">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${msg.sender === "You" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-soft ${
                      msg.sender === "You"
                        ? "bg-sun text-sun-foreground rounded-br-none"
                        : "bg-muted text-foreground rounded-bl-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="mt-1 text-[10px] text-muted-foreground">{msg.time}</span>
                </div>
              ))}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="flex gap-2 border-t border-border pt-4">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={`Message ${selectedContact}...`}
                className="flex-1 rounded-full border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-sun"
              />
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-full bg-secondary px-4 py-2 text-xs font-semibold shadow-soft hover:scale-105 transition-transform"
              >
                <MessageSquare className="size-3.5" /> Speak
              </button>
              <button
                type="submit"
                className="flex size-10 items-center justify-center rounded-full bg-sun text-sun-foreground shadow-soft hover:scale-105 transition-transform"
                aria-label="Send"
              >
                <Send className="size-4" />
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Friend Selector Bar */}
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft">
            <span className="text-sm font-semibold text-muted-foreground">Choose a friend to invite</span>
            <select
              value={selectedContact}
              onChange={(e) => setSelectedContact(e.target.value)}
              className="rounded-xl border border-border bg-background px-4 py-2 text-sm font-bold shadow-soft outline-none focus:border-sun"
            >
              {CONTACTS.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Game Cards Grid linking directly to play2 */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {/* Card 1: Motif Match */}
            <div className="flex flex-col justify-between rounded-3xl border border-border bg-card p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
              <div>
                <span className="mb-4 inline-flex size-12 items-center justify-center rounded-2xl bg-sky/20 text-sky-foreground shadow-soft">
                  <Gamepad2 className="size-6" />
                </span>
                <h2 className="text-xl font-bold tracking-tight">Northeast Motif Match</h2>
                <p className="mt-1 text-sm text-muted-foreground">Match traditional handloom patterns (Puan, Mekhela Chador motifs)</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  window.location.href = "/play2";
                }}
                className="mt-6 text-sm font-bold text-foreground flex items-center gap-1 group hover:text-sun transition-colors"
              >
                Invite {selectedContact} →
              </button>
            </div>

            {/* Card 2: Festival Puzzle */}
            <div className="flex flex-col justify-between rounded-3xl border border-border bg-card p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
              <div>
                <span className="mb-4 inline-flex size-12 items-center justify-center rounded-2xl bg-sage/20 text-sage shadow-soft">
                  <Sparkles className="size-6" />
                </span>
                <h2 className="text-xl font-bold tracking-tight">Hornbill & Bihu Puzzle</h2>
                <p className="mt-1 text-sm text-muted-foreground">Assemble vibrant scenes of cultural festivals and living root bridges</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  window.location.href = "/play2";
                }}
                className="mt-6 text-sm font-bold text-foreground flex items-center gap-1 group hover:text-sun transition-colors"
              >
                Invite {selectedContact} →
              </button>
            </div>

            {/* Card 3: Artifact Restoration */}
            <div className="flex flex-col justify-between rounded-3xl border border-border bg-card p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
              <div>
                <span className="mb-4 inline-flex size-12 items-center justify-center rounded-2xl bg-sun/20 text-sun-foreground shadow-soft">
                  <Compass className="size-6" />
                </span>
                <h2 className="text-xl font-bold tracking-tight">Bamboo & Artifact Room</h2>
                <p className="mt-1 text-sm text-muted-foreground">Restore traditional bamboo instruments and crafts to their rightful places</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  window.location.href = "/play2";
                }}
                className="mt-6 text-sm font-bold text-foreground flex items-center gap-1 group hover:text-sun transition-colors"
              >
                Invite {selectedContact} →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Banner */}
      <div className="mt-10 flex items-center gap-4 rounded-3xl border border-border bg-card p-4 shadow-soft">
        <div className="size-14 shrink-0 overflow-hidden rounded-2xl bg-muted">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
            alt="Friend reminder"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex-1 text-center font-bold text-sm tracking-tight">
          Your friends are only a tap away!
        </div>
      </div>
    </main>
  );
}

export const Route = createFileRoute("/family")({
  component: FamilyPage,
});