"use client";

import React, { useState, useEffect } from "react";
import axiosInstance from "@/lib/AxiosInstance/client";
import { toast } from "react-hot-toast";
import { Download, Loader2, Calendar, Search } from "lucide-react";

interface Lead {
  _id: string;
  name: string;
  email: string;
  phone: string;
  interestService: string;
  interestCountry: string;
  interestCourse: string;
  createdAt: string;
}

export default function ConsultantLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [service, setService] = useState("");
  const [country, setCountry] = useState("");
  const [course, setCourse] = useState("");

  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (from) params.append("from", from);
      if (to) params.append("to", to);
      if (service) params.append("interestService", service);
      if (country) params.append("interestCountry", country);
      if (course) params.append("interestCourse", course);

      const res = await axiosInstance.get(`/immigrant-ai/admin/leads?${params.toString()}`);
      if (res.data.success) {
        setLeads(res.data.data);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load leads");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [from, to, service, country, course]);

  const handleExportCSV = () => {
    const params = new URLSearchParams();
    if (from) params.append("from", from);
    if (to) params.append("to", to);
    if (service) params.append("interestService", service);
    if (country) params.append("interestCountry", country);
    if (course) params.append("interestCourse", course);

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.immigrantjobsworld.com/api";
    // We can fetch from endpoint directly
    window.open(`${baseUrl}/immigrant-ai/admin/leads/export.csv?${params.toString()}`, "_blank");
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Consultant Inquiries</h1>
          <p className="text-slate-500 text-sm mt-1">Leads captured from the Immigrant AI chat widget</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors text-sm"
        >
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* Filters Box */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 grid grid-cols-5 gap-4">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">From Date</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-full p-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-700"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">To Date</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full p-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-700"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Service Interest</label>
          <input
            type="text"
            value={service}
            onChange={(e) => setService(e.target.value)}
            placeholder="e.g. Jobs Search"
            className="w-full p-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-700"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Country Preference</label>
          <input
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="e.g. Dubai"
            className="w-full p-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-700"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Course Preference</label>
          <input
            type="text"
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            placeholder="e.g. IELTS preparation"
            className="w-full p-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-700"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-blue-700" size={32} />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                <th className="p-4">Name</th>
                <th className="p-4">Contact Info</th>
                <th className="p-4">Interest Service</th>
                <th className="p-4">Pref. Country</th>
                <th className="p-4">Pref. Course</th>
                <th className="p-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {leads.map((l) => (
                <tr key={l._id} className="hover:bg-slate-50/50">
                  <td className="p-4 font-semibold text-slate-900">{l.name}</td>
                  <td className="p-4 flex flex-col gap-0.5 text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">{l.phone}</span>
                    <span>{l.email}</span>
                  </td>
                  <td className="p-4">
                    <span className="bg-slate-100 text-slate-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                      {l.interestService || "—"}
                    </span>
                  </td>
                  <td className="p-4 font-semibold text-slate-700">{l.interestCountry || "—"}</td>
                  <td className="p-4 truncate max-w-xs">{l.interestCourse || "—"}</td>
                  <td className="p-4 text-xs text-slate-400">
                    {new Date(l.createdAt).toLocaleDateString()} {new Date(l.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
              {leads.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-20 text-slate-400 font-semibold">
                    No inquiries found matching search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
