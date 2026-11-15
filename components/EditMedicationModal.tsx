'use client';

import React, { useState, useEffect } from 'react';
import { Medication } from '@/lib/types';
import { Edit3, X, Save, Pill } from 'lucide-react';

interface EditMedicationModalProps {
  medication: Medication | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: Medication) => void;
}

export function EditMedicationModal({
  medication,
  isOpen,
  onClose,
  onSave,
}: EditMedicationModalProps) {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [form, setForm] = useState<'pill' | 'capsule' | 'liquid' | 'injection' | 'inhaler'>('pill');
  const [pillColor, setPillColor] = useState('White');
  const [pillShape, setPillShape] = useState('Oval');
  const [scheduledTimes, setScheduledTimes] = useState('08:00');
  const [withFood, setWithFood] = useState<'before_meal' | 'with_meal' | 'after_meal' | 'anytime'>('with_meal');
  const [purpose, setPurpose] = useState('');
  const [instructions, setInstructions] = useState('');
  const [stockCount, setStockCount] = useState(30);
  const [imageUrl, setImageUrl] = useState('');
  const [pillImprint, setPillImprint] = useState('');

  useEffect(() => {
    if (medication) {
      setName(medication.name);
      setDosage(medication.dosage);
      setForm(medication.form);
      setPillColor(medication.pillColor);
      setPillShape(medication.pillShape);
      setScheduledTimes(medication.scheduledTimes.join(', '));
      setWithFood(medication.withFood);
      setPurpose(medication.purpose);
      setInstructions(medication.specialInstructions);
      setStockCount(medication.stockCount);
      setImageUrl(medication.imageUrl || '');
      setPillImprint(medication.pillImprint || '');
    }
  }, [medication]);

  if (!isOpen || !medication) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Medication = {
      ...medication,
      name,
      dosage,
      form,
      pillColor,
      pillShape,
      pillImprint: pillImprint || medication.pillImprint,
      imageUrl: imageUrl || medication.imageUrl,
      scheduledTimes: scheduledTimes.split(',').map((s) => s.trim()).filter(Boolean),
      withFood,
      purpose,
      specialInstructions: instructions,
      stockCount: Number(stockCount) || 0,
    };
    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto border border-[#E6E4DC]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E6E4DC] pb-3">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#E8F3F3] text-[#167C80]">
              <Edit3 className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-extrabold text-base text-[#263238]">Edit Medication Schedule</h3>
              <p className="text-xs text-[#546E7A]">Modify dosage, schedule times, or instructions</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[#546E7A] hover:text-[#263238] p-1 font-bold text-lg"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-[#546E7A] uppercase mb-1">
                Medicine Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-[#E6E4DC] rounded-xl text-xs focus:ring-2 focus:ring-[#167C80]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#546E7A] uppercase mb-1">
                Dosage *
              </label>
              <input
                type="text"
                required
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                className="w-full px-3 py-2 border border-[#E6E4DC] rounded-xl text-xs focus:ring-2 focus:ring-[#167C80]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="block text-[11px] font-bold text-[#546E7A] uppercase mb-1">Form</label>
              <select
                value={form}
                onChange={(e) => setForm(e.target.value as any)}
                className="w-full px-3 py-2 border border-[#E6E4DC] rounded-xl text-xs"
              >
                <option value="pill">Pill / Tablet</option>
                <option value="capsule">Capsule</option>
                <option value="liquid">Liquid</option>
                <option value="injection">Injection</option>
                <option value="inhaler">Inhaler</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#546E7A] uppercase mb-1">Pill Color</label>
              <input
                type="text"
                value={pillColor}
                onChange={(e) => setPillColor(e.target.value)}
                className="w-full px-3 py-2 border border-[#E6E4DC] rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#546E7A] uppercase mb-1">Scheduled Times (comma-separated)</label>
              <input
                type="text"
                value={scheduledTimes}
                onChange={(e) => setScheduledTimes(e.target.value)}
                placeholder="08:00, 20:00"
                className="w-full px-3 py-2 border border-[#E6E4DC] rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-[#546E7A] uppercase mb-1">Food Requirement</label>
              <select
                value={withFood}
                onChange={(e) => setWithFood(e.target.value as any)}
                className="w-full px-3 py-2 border border-[#E6E4DC] rounded-xl text-xs"
              >
                <option value="with_meal">Take with meal</option>
                <option value="after_meal">Take after meal</option>
                <option value="before_meal">Take before meal (empty stomach)</option>
                <option value="anytime">Anytime / With or without food</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#546E7A] uppercase mb-1">Stock Count (Remaining Pills)</label>
              <input
                type="number"
                value={stockCount}
                onChange={(e) => setStockCount(Number(e.target.value))}
                className="w-full px-3 py-2 border border-[#E6E4DC] rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-[#546E7A] uppercase mb-1">
                Pill Imprint (Printed on Tablet)
              </label>
              <input
                type="text"
                value={pillImprint}
                onChange={(e) => setPillImprint(e.target.value)}
                placeholder="e.g. M 500"
                className="w-full px-3 py-2 border border-[#E6E4DC] rounded-xl text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#546E7A] uppercase mb-1">
                Pill Photo Image URL (For Senior Visual ID)
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-2 border border-[#E6E4DC] rounded-xl text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#546E7A] uppercase mb-1">Special Instructions for Arthur</label>
            <input
              type="text"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full px-3 py-2 border border-[#E6E4DC] rounded-xl text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E6E4DC]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#E6E4DC] text-[#546E7A] text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#167C80] hover:bg-[#126366] text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
