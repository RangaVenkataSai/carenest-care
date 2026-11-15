'use client';

import React, { useState } from 'react';
import { CareJournalEntry } from '@/lib/types';
import { BookOpen, CheckCircle2, Calendar, FileText, AlertTriangle, Heart, User, Filter } from 'lucide-react';

interface CareJournalProps {
  entries: CareJournalEntry[];
  onAddNote?: (note: string) => void;
}

export function CareJournal({ entries, onAddNote }: CareJournalProps) {
  const [filter, setFilter] = useState<string>('all');
  const [newNote, setNewNote] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const filteredEntries = filter === 'all'
    ? entries
    : entries.filter((e) => e.category === filter);

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    onAddNote?.(newNote.trim());
    setNewNote('');
    setShowAddForm(false);
  };

  return (
    <div className="bg-white rounded-3xl border border-[#E6E4DC] p-6 sm:p-7 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E6E4DC] pb-4">
        <div>
          <h2 className="text-lg font-bold text-[#263238] flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#167C80]" />
            <span>Care Journal & Audit Feed</span>
          </h2>
          <p className="text-xs text-[#546E7A]">
            Chronological log of family updates, clinical notes, and dose confirmations
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#F8F7F2] p-1 rounded-2xl border border-[#E6E4DC]">
          {[
            { id: 'all', label: 'All' },
            { id: 'medication', label: 'Meds' },
            { id: 'appointment', label: 'Visits' },
            { id: 'note', label: 'Notes' },
            { id: 'alert', label: 'Alerts' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                filter === cat.id
                  ? 'bg-[#167C80] text-white shadow-2xs'
                  : 'text-[#546E7A] hover:text-[#263238] hover:bg-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Add note shortcut */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="text-xs font-bold text-[#167C80] hover:text-[#126366] flex items-center gap-1"
        >
          {showAddForm ? '✕ Cancel' : '+ Add Caregiver or Family Note'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleCreateNote} className="bg-[#F8F7F2] p-4 rounded-2xl border border-[#E6E4DC] space-y-3">
          <textarea
            rows={2}
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Log an observation, blood pressure note, or family update..."
            className="w-full p-3 rounded-xl border border-[#E6E4DC] bg-white text-xs focus:ring-2 focus:ring-[#167C80] focus:outline-hidden"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#167C80] text-white text-xs font-bold shadow-xs hover:bg-[#126366]"
            >
              Save to Journal
            </button>
          </div>
        </form>
      )}

      {/* Entries Stream */}
      <div className="space-y-3">
        {filteredEntries.map((entry) => {
          let icon = <CheckCircle2 className="w-4 h-4 text-[#1B8354]" />;
          let iconBg = 'bg-[#F0F6F2] text-[#1B8354] border-[#B7D4C2]';

          if (entry.category === 'appointment') {
            icon = <Calendar className="w-4 h-4 text-[#167C80]" />;
            iconBg = 'bg-[#E8F3F3] text-[#167C80] border-[#B7D4C2]';
          } else if (entry.category === 'note') {
            icon = <FileText className="w-4 h-4 text-blue-700" />;
            iconBg = 'bg-blue-50 text-blue-700 border-blue-200';
          } else if (entry.category === 'alert') {
            icon = <AlertTriangle className="w-4 h-4 text-[#D32F2F]" />;
            iconBg = 'bg-[#FDF3EF] text-[#D32F2F] border-[#F2A58A]';
          }

          return (
            <div
              key={entry.id}
              className="p-4 rounded-2xl border border-[#E6E4DC] bg-white hover:border-[#B7D4C2] transition-colors flex items-start gap-3.5"
            >
              <div className={`p-2 rounded-xl border shrink-0 mt-0.5 ${iconBg}`}>
                {icon}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h4 className="font-bold text-sm text-[#263238]">{entry.title}</h4>
                  <span className="text-[11px] font-mono text-[#546E7A]">
                    {new Date(entry.timestamp).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                    })}{' '}
                    •{' '}
                    {new Date(entry.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <p className="text-xs text-[#546E7A] leading-relaxed">
                  {entry.description}
                </p>

                <div className="text-[10px] text-[#546E7A] pt-1">
                  Logged by: <strong className="text-[#263238]">{entry.authorName}</strong> ({entry.authorRole})
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
