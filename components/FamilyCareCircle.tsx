'use client';

import React, { useState } from 'react';
import { SeniorProfile, CareCircleMember } from '@/lib/types';
import { Heart, ShieldCheck, User, Stethoscope, Phone, Mail, Award, CheckCircle } from 'lucide-react';

interface FamilyCareCircleProps {
  senior: SeniorProfile;
  members: CareCircleMember[];
}

export function FamilyCareCircle({ senior, members }: FamilyCareCircleProps) {
  const [selectedMember, setSelectedMember] = useState<CareCircleMember | null>(null);

  const nonSeniorMembers = members.filter((m) => m.role !== 'senior');

  return (
    <div className="bg-white rounded-3xl border border-[#E6E4DC] p-6 sm:p-7 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E6E4DC] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-[#263238]">Family Care Circle</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E8F3F3] text-[#167C80]">
              Passcode Protected
            </span>
          </div>
          <p className="text-xs text-[#546E7A]">
            Collaborative care network with senior autonomy at the center
          </p>
        </div>

        <div className="text-xs font-mono font-bold bg-[#F8F7F2] text-[#167C80] px-3 py-1.5 rounded-xl border border-[#E6E4DC]">
          Circle ID: {senior.circleCode}
        </div>
      </div>

      {/* Central Visual Hub & Satellite Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        {/* Center: Elderly Patient Focus Card */}
        <div className="lg:col-span-1 bg-gradient-to-b from-[#E8F3F3] to-[#F8F7F2] border-2 border-[#167C80] rounded-3xl p-6 text-center space-y-4 shadow-sm relative overflow-hidden">
          <div className="w-20 h-20 rounded-full border-4 border-white shadow-md mx-auto overflow-hidden bg-white">
            <img
              src={senior.avatarUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=240&auto=format&fit=crop&q=80'}
              alt={senior.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#167C80] text-white mb-1.5">
              <Award className="w-3.5 h-3.5" />
              <span>Center of Care</span>
            </div>
            <h3 className="text-xl font-black text-[#263238]">{senior.name}</h3>
            <p className="text-xs text-[#546E7A]">Age {senior.age} • Independent Living</p>
          </div>

          <div className="bg-white/90 backdrop-blur-xs p-3 rounded-2xl border border-[#E6E4DC] text-xs space-y-1 text-left">
            <div className="font-bold text-[#263238]">Active Conditions:</div>
            <div className="flex flex-wrap gap-1">
              {senior.chronicConditions.map((c) => (
                <span
                  key={c}
                  className="px-2 py-0.5 rounded-md bg-[#F0F6F2] text-[#1B8354] font-medium text-[11px]"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Orbit: Authorized Members Grid */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {nonSeniorMembers.map((member) => {
            const isSelected = selectedMember?.id === member.id;
            let roleIcon = <Heart className="w-4 h-4 text-[#F2A58A]" />;
            let roleBadge = 'bg-[#FDF3EF] text-[#D32F2F] border-[#F2A58A]';

            if (member.role === 'caregiver') {
              roleIcon = <Stethoscope className="w-4 h-4 text-[#167C80]" />;
              roleBadge = 'bg-[#E8F3F3] text-[#167C80] border-[#B7D4C2]';
            } else if (member.role === 'doctor') {
              roleIcon = <ShieldCheck className="w-4 h-4 text-blue-700" />;
              roleBadge = 'bg-blue-50 text-blue-800 border-blue-200';
            }

            return (
              <div
                key={member.id}
                onClick={() => setSelectedMember(isSelected ? null : member)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer text-left space-y-3 ${
                  isSelected
                    ? 'border-[#167C80] bg-[#E8F3F3]/40 shadow-xs ring-2 ring-[#167C80]/20'
                    : 'border-[#E6E4DC] bg-[#F8F7F2]/40 hover:bg-white hover:border-[#B7D4C2]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`p-2 rounded-xl border ${roleBadge}`}>
                    {roleIcon}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-[#E6E4DC] text-[#546E7A] uppercase">
                    {member.status.replace('_', ' ')}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-[#263238]">{member.name}</h4>
                  <p className="text-xs text-[#546E7A] leading-tight">{member.relation}</p>
                </div>

                <div className="text-[11px] text-[#546E7A] line-clamp-2">
                  <strong className="text-[#263238]">Recent:</strong> {member.recentActivity}
                </div>

                <div className="pt-2 border-t border-[#E6E4DC]/60 flex items-center justify-between text-[11px]">
                  <span className="text-[#167C80] font-semibold">
                    {member.permissions.length} Permissions
                  </span>
                  <span className="text-[10px] text-[#546E7A]">Click to inspect</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Member Detail Modal / Drawer */}
      {selectedMember && (
        <div className="p-4 rounded-2xl bg-[#E8F3F3]/60 border border-[#B7D4C2] space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-[#263238]">{selectedMember.name}</span>
              <span className="text-xs text-[#546E7A]">({selectedMember.relation})</span>
            </div>
            <button
              onClick={() => setSelectedMember(null)}
              className="text-xs text-[#546E7A] hover:text-[#263238] font-bold"
            >
              ✕ Close
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <strong className="text-[#263238] block mb-1">Access Permissions:</strong>
              <div className="flex flex-wrap gap-1">
                {selectedMember.permissions.map((p) => (
                  <span
                    key={p}
                    className="px-2 py-0.5 rounded-md bg-white border border-[#E6E4DC] text-[#263238]"
                  >
                    ✓ {p}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <div>
                <strong className="text-[#263238]">Phone:</strong> {selectedMember.phone}
              </div>
              <div>
                <strong className="text-[#263238]">Email:</strong> {selectedMember.email}
              </div>
              <div>
                <strong className="text-[#263238]">Recent Activity:</strong>{' '}
                <span className="italic text-[#546E7A]">{selectedMember.recentActivity}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
