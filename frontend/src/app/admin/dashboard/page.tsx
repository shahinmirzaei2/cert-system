"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

interface Stats {
  total: number;
  active: number;
  revoked: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, revoked: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await apiFetch("/certificates?page=1&page_size=1");
        if (res.ok) {
          const data = await res.json();
          const total = data.total;

          const allRes = await apiFetch(`/certificates?page=1&page_size=${total || 1}`);
          if (allRes.ok) {
            const allData = await allRes.json();
            const items = allData.items || [];
            const active = items.filter(
              (c: { status: string }) => c.status === "active"
            ).length;
            const revoked = items.filter(
              (c: { status: string }) => c.status === "revoked"
            ).length;
            setStats({ total, active, revoked });
          }
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const cards = [
    {
      title: "کل گواهی‌ها",
      value: stats.total,
      color: "bg-blue-500",
      lightColor: "bg-blue-50 text-blue-700",
    },
    {
      title: "گواهی‌های معتبر",
      value: stats.active,
      color: "bg-emerald-500",
      lightColor: "bg-emerald-50 text-emerald-700",
    },
    {
      title: "گواهی‌های لغوشده",
      value: stats.revoked,
      color: "bg-red-500",
      lightColor: "bg-red-50 text-red-700",
    },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-6">داشبورد</h2>

      {loading ? (
        <p className="text-gray-500">در حال بارگذاری...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {cards.map((card) => (
              <div
                key={card.title}
                className="bg-white rounded-xl shadow-sm border p-6"
              >
                <p className="text-sm text-gray-500 mb-2">{card.title}</p>
                <p className="text-3xl font-bold text-gray-800">{card.value}</p>
                <div
                  className={`mt-3 inline-block px-3 py-1 rounded-full text-xs font-medium ${card.lightColor}`}
                >
                  {card.title}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-4">
            <Link
              href="/admin/certificates"
              className="bg-white border border-gray-200 hover:border-blue-300 rounded-xl px-6 py-4 text-gray-700 hover:text-blue-600 transition shadow-sm"
            >
              مشاهده لیست گواهی‌ها
            </Link>
            <Link
              href="/admin/certificates/new"
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 py-4 transition shadow-sm"
            >
              صدور گواهی جدید
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
