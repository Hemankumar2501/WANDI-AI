import { useState } from "react";
import { TopNavBar } from "@/components/layout/TopNavBar";
import { BottomNavBar } from "@/components/layout/BottomNavBar";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, PieChart, Receipt, UserPlus, Wallet } from "lucide-react";

const SPLIT_MODES = [
  { label: "Equal",      icon: "⚖️", color: "bg-blue-600",   text: "text-white" },
  { label: "Percentage",  icon: "📊", color: "bg-amber-500",  text: "text-white" },
  { label: "Custom",      icon: "✏️", color: "bg-violet-600", text: "text-white" },
] as const;

export default function Expenses() {
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [desc, setDesc] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [splitIdx, setSplitIdx] = useState(0);
  const splitMode = SPLIT_MODES[splitIdx];

  // Mock data
  const total = 1250.0;
  const youOwe = 0.0;
  const owedToYou = 340.5;

  const expenses = [
    { id: 1, title: "Dinner at Sushi Dai", amount: 120, paidBy: "You", date: "Today, 8:00 PM" },
    { id: 2, title: "Shinkansen Tickets", amount: 280, paidBy: "Sarah", date: "Yesterday" },
    { id: 3, title: "Matcha Lattes", amount: 15, paidBy: "You", date: "Yesterday" },
  ];

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !desc) {
      toast.error("Please fill out amount and description");
      return;
    }
    toast.success("Expense added successfully!");
    setShowAdd(false);
    setAmount("");
    setDesc("");
  };

  return (
    <div className="min-h-screen bg-surface font-body pb-24">
      <TopNavBar />
      <div className="pt-24 px-6 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-surface-container-high rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-on-surface" />
          </button>
          <h1 className="text-2xl font-headline font-bold text-on-surface">Trip Expenses</h1>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-primary-container p-6 rounded-2xl flex flex-col justify-between shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-on-primary-container" />
              </div>
              <span className="text-on-primary-container text-xs font-semibold bg-white/20 px-2 py-1 rounded-full">Total Trip</span>
            </div>
            <div>
              <p className="text-sm font-medium text-on-primary-container/80 mb-1">Spent so far</p>
              <h2 className="text-3xl font-extrabold text-on-primary-container font-headline">£{total.toFixed(2)}</h2>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex-1 bg-surface-container-low p-4 rounded-2xl border border-outline-variant/30 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-outline uppercase tracking-wider mb-1">You Owe</p>
                <p className="text-xl font-bold text-error-m3">£{youOwe.toFixed(2)}</p>
              </div>
            </div>
            <div className="flex-1 bg-surface-container-low p-4 rounded-2xl border border-outline-variant/30 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-outline uppercase tracking-wider mb-1">Owed to You</p>
                <p className="text-xl font-bold text-green-600">£{owedToYou.toFixed(2)}</p>
              </div>
              <button onClick={() => toast("Sending reminders...")} className="bg-green-600/10 text-green-600 px-3 py-1.5 rounded-full text-xs font-bold hover:bg-green-600/20 transition-colors">
                Settle up
              </button>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex gap-4 mb-8">
          <Button onClick={() => setShowAdd(true)} className="flex-1 rounded-xl h-12 bg-on-surface text-surface hover:bg-on-surface/90 font-bold gap-2 group">
            <Receipt className="w-4 h-4 group-hover:scale-110 transition-transform" /> Add Expense
          </Button>
          <button
            onClick={() => {
              const next = (splitIdx + 1) % SPLIT_MODES.length;
              setSplitIdx(next);
              toast.success(`Split mode changed to ${SPLIT_MODES[next].label}`);
            }}
            className={`flex-1 rounded-xl h-12 font-bold text-sm flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all ${splitMode.color} ${splitMode.text}`}
          >
            <span className="text-lg">{splitMode.icon}</span>
            <span>Split: {splitMode.label}</span>
            <PieChart className="w-4 h-4 opacity-70" />
          </button>
        </div>

        {/* Add Modal */}
        {showAdd && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-surface w-full max-w-sm rounded-[32px] p-6 shadow-xl animate-in slide-in-from-bottom-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-headline text-xl font-bold">New Expense</h3>
                <button onClick={() => setShowAdd(false)} className="w-8 h-8 flex items-center justify-center bg-surface-container-high rounded-full hover:bg-surface-container-highest transition-colors">✕</button>
              </div>
              <form onSubmit={handleAddSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-outline uppercase tracking-widest mb-2 block">Amount (£)</label>
                  <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-surface-container-low border-none rounded-xl h-14 px-4 text-xl font-bold focus:ring-2 focus:ring-primary-container transition-all" placeholder="0.00" autoFocus />
                </div>
                <div>
                  <label className="text-xs font-bold text-outline uppercase tracking-widest mb-2 block">Description</label>
                  <input type="text" value={desc} onChange={(e) => setDesc(e.target.value)} className="w-full bg-surface-container-low border-none rounded-xl h-14 px-4 font-medium focus:ring-2 focus:ring-primary-container transition-all" placeholder="e.g. Dinner at Shibuya" />
                </div>
                <div>
                  <label className="text-xs font-bold text-outline uppercase tracking-widest mb-2 block">Paid By</label>
                  <div className="flex gap-2">
                    <button type="button" className="px-5 py-3 rounded-xl bg-primary-container text-on-primary text-sm font-bold shadow-sm">You</button>
                    <button type="button" className="px-5 py-3 rounded-xl bg-surface-container-low text-on-surface text-sm font-bold border border-outline-variant/20 hover:bg-surface-container-high transition-colors">Sarah</button>
                    <button type="button" className="px-5 py-3 rounded-xl bg-surface-container-low text-on-surface text-sm font-bold border border-outline-variant/20 hover:bg-surface-container-high transition-colors flex items-center gap-1"><UserPlus className="w-4 h-4" /> Split</button>
                  </div>
                </div>
                <div className="pt-4">
                  <Button type="submit" className="w-full rounded-xl h-14 bg-primary-container text-white font-bold text-lg hover:scale-[1.02] active:scale-95 transition-all">Save Expense</Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Transactions list */}
        <div>
          <h3 className="font-headline text-lg font-bold text-on-surface mb-4">Recent Transactions</h3>
          <div className="space-y-3">
            {expenses.map((expense) => (
              <div key={expense.id} className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/20 flex items-center justify-between hover:border-outline-variant/40 transition-colors cursor-pointer active:scale-[0.98]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant shrink-0">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface leading-tight">{expense.title}</h4>
                    <p className="text-xs text-on-surface-variant font-medium mt-1">
                      Paid by <span className={expense.paidBy === "You" ? "text-primary-container font-semibold" : ""}>{expense.paidBy}</span> • {expense.date}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-lg font-bold text-on-surface font-headline">£{expense.amount.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <BottomNavBar />
    </div>
  );
}
