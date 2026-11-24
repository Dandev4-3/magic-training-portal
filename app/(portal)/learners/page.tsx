'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function LearnersPage() {
  const [learners, setLearners] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', address: '', notes: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const r = await fetch(`/api/learners?search=${encodeURIComponent(search)}`);
    const d = await r.json();
    setLearners(d.learners);
    setTotal(d.total);
    setLoading(false);
  };

  useEffect(() => { load(); }, [search]);

  const save = async () => {
    setSaving(true);
    await fetch('/api/learners', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setShowAdd(false);
    setForm({ firstName: '', lastName: '', email: '', phone: '', address: '', notes: '' });
    setSaving(false);
    load();
  };

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{color:'#1a2340'}}>Learners</h1>
          <p className="text-gray-500 text-sm">{total} learners total</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-5 py-2.5 rounded-lg text-sm">+ Add Learner</button>
      </div>
      <div className="mb-5">
        <input value={search} onChange={e => setSearch(e.target.value)} className="w-full md:w-80 px-4 py-2.5 border border-gray-200 rounded-lg text-sm" placeholder="Search by name, email, phone..." />
      </div>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Name','Email','Phone','Employer','Courses',''].map(h => <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading && <tr><td colSpan={6} className="text-center py-10 text-gray-400">Loading...</td></tr>}
            {!loading && learners.length === 0 && <tr><td colSpan={6} className="text-center py-10 text-gray-400">No learners found</td></tr>}
            {learners.map(l => (
              <tr key={l.id} className="hover:bg-gray-50">
                <td className="px-5 py-3 font-medium text-gray-900">{l.first_name} {l.last_name}</td>
                <td className="px-5 py-3 text-gray-600">{l.email || '-'}</td>
                <td className="px-5 py-3 text-gray-600">{l.phone || '-'}</td>
                <td className="px-5 py-3 text-gray-600">{l.employer_name || '-'}</td>
                <td className="px-5 py-3"><span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">{l.registration_count}</span></td>
                <td className="px-5 py-3 text-right"><Link href={`/learners/${l.id}`} className="text-yellow-600 hover:text-yellow-700 text-xs font-medium">View</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-7">
            <h2 className="text-lg font-bold mb-5" style={{color:'#1a2340'}}>Add New Learner</h2>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-xs font-medium text-gray-600 mb-1 block">First Name *</label><input value={form.firstName} onChange={e => setForm({...form,firstName:e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm" /></div>
              <div><label className="text-xs font-medium text-gray-600 mb-1 block">Last Name *</label><input value={form.lastName} onChange={e => setForm({...form,lastName:e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm" /></div>
              <div><label className="text-xs font-medium text-gray-600 mb-1 block">Email</label><input type="email" value={form.email} onChange={e => setForm({...form,email:e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm" /></div>
              <div><label className="text-xs font-medium text-gray-600 mb-1 block">Phone</label><input value={form.phone} onChange={e => setForm({...form,phone:e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm" /></div>
              <div className="col-span-2"><label className="text-xs font-medium text-gray-600 mb-1 block">Address</label><input value={form.address} onChange={e => setForm({...form,address:e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm" /></div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAdd(false)} className="flex-1 border border-gray-200 rounded-lg py-2.5 text-sm text-gray-600">Cancel</button>
              <button onClick={save} disabled={saving||!form.firstName||!form.lastName} className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-lg py-2.5 text-sm disabled:opacity-50">{saving?'Saving...':'Add Learner'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
