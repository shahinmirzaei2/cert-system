"use client";

import { useEffect, useState, useCallback } from "react";
import { apiFetch } from "@/lib/api";

interface Certificate {
  id: string;
  holder_name: string;
  holder_family: string;
  national_id: string;
  issuer_name: string;
  certificate_title: string;
  issue_date: string;
  status: string;
  revoke_reason: string | null;
}

export default function CertificatesListPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [revokeReason, setRevokeReason] = useState("");
  const pageSize = 20;

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

  const fetchCertificates = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      });
      if (search) params.set("search", search);
      const res = await apiFetch(`/certificates?${params}`);
      if (res.ok) {
        const data = await res.json();
        setCertificates(data.items);
        setTotal(data.total);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const handleRevoke = async (id: string) => {
    try {
      const res = await apiFetch(`/certificates/${id}/revoke`, {
        method: "PATCH",
        body: JSON.stringify({ reason: revokeReason || null }),
      });
      if (res.ok) {
        setRevoking(null);
        setRevokeReason("");
        fetchCertificates();
      }
    } catch {
      // ignore
    }
  };

  const downloadQr = (id: string) => {
    window.open(`${API_URL}/certificates/${id}/qr`, "_blank");
  };

  const totalPages = Math.ceil(total / pageSize);

  const statusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
            معتبر
          </span>
        );
      case "revoked":
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700">
            لغوشده
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
            {status}
          </span>
        );
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">لیست گواهی‌ها</h2>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="جستجو بر اساس نام یا کد ملی..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
          >
            جستجو
          </button>
        </form>
      </div>

      {loading ? (
        <p className="text-gray-500">در حال بارگذاری...</p>
      ) : certificates.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
          <p className="text-gray-500">گواهی‌ای یافت نشد</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">
                    نام دارنده
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">
                    کد ملی
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">
                    صادرکننده
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">
                    عنوان
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">
                    تاریخ صدور
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">
                    وضعیت
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">
                    عملیات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {certificates.map((cert) => (
                  <tr key={cert.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {cert.holder_name} {cert.holder_family}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {cert.national_id}
                    </td>
                    <td className="px-4 py-3">{cert.issuer_name}</td>
                    <td className="px-4 py-3">{cert.certificate_title}</td>
                    <td className="px-4 py-3">{cert.issue_date}</td>
                    <td className="px-4 py-3">{statusBadge(cert.status)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => downloadQr(cert.id)}
                          className="text-blue-600 hover:text-blue-800 text-xs"
                        >
                          دانلود QR
                        </button>
                        {cert.status === "active" && (
                          <button
                            onClick={() => setRevoking(cert.id)}
                            className="text-red-600 hover:text-red-800 text-xs"
                          >
                            لغو
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-40 hover:bg-gray-100 transition"
              >
                قبلی
              </button>
              <span className="text-sm text-gray-600">
                صفحه {page} از {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-40 hover:bg-gray-100 transition"
              >
                بعدی
              </button>
            </div>
          )}
        </>
      )}

      {revoking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              لغو گواهی
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              آیا از لغو این گواهی اطمینان دارید؟ این عمل غیرقابل بازگشت است.
            </p>
            <textarea
              placeholder="دلیل لغو (اختیاری)"
              value={revokeReason}
              onChange={(e) => setRevokeReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-red-500 mb-4 resize-none"
              rows={3}
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setRevoking(null);
                  setRevokeReason("");
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                انصراف
              </button>
              <button
                onClick={() => handleRevoke(revoking)}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                لغو گواهی
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
