"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Certificate {
  id: string;
  holder_name: string;
  holder_family: string;
  issuer_name: string;
  certificate_title: string;
  issue_date: string;
  expiry_date: string | null;
  status: string;
  revoke_reason: string | null;
}

interface VerifyResponse {
  valid: boolean;
  status: string;
  certificate: Certificate | null;
  certificate_image_url: string | null;
  issuer_logo_url: string | null;
}

export default function VerifyPage() {
  const params = useParams();
  const uuid = params.uuid as string;
  const [data, setData] = useState<VerifyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

  useEffect(() => {
    async function verify() {
      try {
        const res = await fetch(`${API_URL}/verify/${uuid}`);
        if (res.status === 404) {
          setNotFound(true);
          return;
        }
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    verify();
  }, [uuid, API_URL]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">در حال بررسی اصالت گواهی...</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-10 h-10 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 20a8 8 0 100-16 8 8 0 000 16z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">
            گواهی یافت نشد
          </h1>
          <p className="text-sm text-gray-500">
            گواهی با این شناسه در سامانه ثبت نشده است.
          </p>
        </div>
      </div>
    );
  }

  if (data?.status === "tampered") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-10 h-10 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01M12 3l9.09 16.91H2.91L12 3z"
              />
            </svg>
          </div>
          <div className="inline-block px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-bold mb-4">
            گواهی جعلی یا دستکاری‌شده
          </div>
          <p className="text-sm text-gray-500">
            امضای دیجیتال این گواهی مغایرت دارد. اطلاعات نمایش داده نمی‌شود.
          </p>
        </div>
      </div>
    );
  }

  if (data?.status === "revoked" && data.certificate) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-10 h-10 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636"
                />
              </svg>
            </div>
            <div className="inline-block px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-bold mb-6">
              گواهی لغو شده
            </div>

            <div className="text-right space-y-3 border-t pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">نام دارنده:</span>
                <span className="font-medium text-gray-800">
                  {data.certificate.holder_name}{" "}
                  {data.certificate.holder_family}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">صادرکننده:</span>
                <span className="font-medium text-gray-800">
                  {data.certificate.issuer_name}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">عنوان:</span>
                <span className="font-medium text-gray-800">
                  {data.certificate.certificate_title}
                </span>
              </div>
              {data.certificate.revoke_reason && (
                <div className="bg-red-50 rounded-lg p-3 mt-4">
                  <p className="text-xs text-red-600 font-medium mb-1">
                    دلیل لغو:
                  </p>
                  <p className="text-sm text-red-700">
                    {data.certificate.revoke_reason}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (data?.valid && data.certificate) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-10 h-10 text-emerald-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <div className="inline-block px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-bold mb-2">
                گواهی معتبر
              </div>
            </div>

            {data.issuer_logo_url && (
              <div className="flex justify-center mb-6">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={data.issuer_logo_url}
                  alt="لوگوی صادرکننده"
                  className="max-h-20 object-contain"
                />
              </div>
            )}

            <div className="space-y-3 border-t border-b py-4 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">نام دارنده:</span>
                <span className="font-medium text-gray-800">
                  {data.certificate.holder_name}{" "}
                  {data.certificate.holder_family}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">صادرکننده:</span>
                <span className="font-medium text-gray-800">
                  {data.certificate.issuer_name}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">عنوان گواهی:</span>
                <span className="font-medium text-gray-800">
                  {data.certificate.certificate_title}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">تاریخ صدور:</span>
                <span className="font-medium text-gray-800">
                  {data.certificate.issue_date}
                </span>
              </div>
              {data.certificate.expiry_date && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">تاریخ انقضا:</span>
                  <span className="font-medium text-gray-800">
                    {data.certificate.expiry_date}
                  </span>
                </div>
              )}
            </div>

            {data.certificate_image_url && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">
                  تصویر گواهی:
                </p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={data.certificate_image_url}
                  alt="تصویر گواهی"
                  className="w-full rounded-lg border shadow-sm"
                />
              </div>
            )}
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            سامانه صدور و اصالت‌سنجی گواهی الکترونیکی
          </p>
        </div>
      </div>
    );
  }

  return null;
}
