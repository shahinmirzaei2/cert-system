"use client";

import { useState, useRef } from "react";
import { apiFetch } from "@/lib/api";

export default function NewCertificatePage() {
  const [formData, setFormData] = useState({
    issuer_name: "",
    holder_name: "",
    holder_family: "",
    national_id: "",
    certificate_title: "",
    issue_date: "",
    expiry_date: "",
  });
  const [certImage, setCertImage] = useState<File | null>(null);
  const [certPreview, setCertPreview] = useState<string | null>(null);
  const [logoImage, setLogoImage] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    qr_download_url: string;
    certificate: { id: string };
  } | null>(null);

  const certInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "cert" | "logo"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    if (type === "cert") {
      setCertImage(file);
      setCertPreview(url);
    } else {
      setLogoImage(file);
      setLogoPreview(url);
    }
  };

  const handleDrop = (
    e: React.DragEvent,
    type: "cert" | "logo"
  ) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (type === "cert") {
      setCertImage(file);
      setCertPreview(url);
    } else {
      setLogoImage(file);
      setLogoPreview(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResult(null);

    if (!certImage) {
      setError("تصویر گواهی الزامی است");
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("issuer_name", formData.issuer_name);
      fd.append("holder_name", formData.holder_name);
      fd.append("holder_family", formData.holder_family);
      fd.append("national_id", formData.national_id);
      fd.append("certificate_title", formData.certificate_title);
      fd.append("issue_date", formData.issue_date);
      if (formData.expiry_date) fd.append("expiry_date", formData.expiry_date);
      fd.append("certificate_image", certImage);
      if (logoImage) fd.append("issuer_logo", logoImage);

      const res = await apiFetch("/certificates", {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "خطا در صدور گواهی");
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در صدور گواهی");
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-emerald-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            گواهی با موفقیت صادر شد
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            QRCode تولید شده را دانلود کنید
          </p>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={result.qr_download_url}
            alt="QR Code"
            className="mx-auto mb-6 border rounded-lg"
            width={250}
            height={250}
          />

          <div className="flex gap-3 justify-center">
            <a
              href={result.qr_download_url}
              download
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
            >
              دانلود QRCode
            </a>
            <button
              onClick={() => {
                setResult(null);
                setFormData({
                  issuer_name: "",
                  holder_name: "",
                  holder_family: "",
                  national_id: "",
                  certificate_title: "",
                  issue_date: "",
                  expiry_date: "",
                });
                setCertImage(null);
                setCertPreview(null);
                setLogoImage(null);
                setLogoPreview(null);
              }}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm"
            >
              صدور گواهی جدید
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-gray-800 mb-6">صدور گواهی جدید</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-sm border p-6 space-y-5"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              نام صادرکننده
            </label>
            <input
              type="text"
              name="issuer_name"
              value={formData.issuer_name}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              عنوان گواهی
            </label>
            <input
              type="text"
              name="certificate_title"
              value={formData.certificate_title}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              نام
            </label>
            <input
              type="text"
              name="holder_name"
              value={formData.holder_name}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              نام خانوادگی
            </label>
            <input
              type="text"
              name="holder_family"
              value={formData.holder_family}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              کد ملی
            </label>
            <input
              type="text"
              name="national_id"
              value={formData.national_id}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              تاریخ صدور
            </label>
            <input
              type="date"
              name="issue_date"
              value={formData.issue_date}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              تاریخ انقضا (اختیاری)
            </label>
            <input
              type="date"
              name="expiry_date"
              value={formData.expiry_date}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            تصویر گواهی (الزامی)
          </label>
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, "cert")}
            onClick={() => certInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition"
          >
            {certPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={certPreview}
                alt="پیش‌نمایش"
                className="max-h-48 mx-auto rounded"
              />
            ) : (
              <p className="text-sm text-gray-500">
                تصویر را بکشید و رها کنید یا کلیک کنید
              </p>
            )}
          </div>
          <input
            ref={certInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e, "cert")}
            className="hidden"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            لوگوی صادرکننده (اختیاری - روی QRCode نمایش داده می‌شود)
          </label>
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, "logo")}
            onClick={() => logoInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition"
          >
            {logoPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoPreview}
                alt="پیش‌نمایش لوگو"
                className="max-h-24 mx-auto rounded"
              />
            ) : (
              <p className="text-sm text-gray-500">
                لوگو را بکشید و رها کنید یا کلیک کنید
              </p>
            )}
          </div>
          <input
            ref={logoInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e, "logo")}
            className="hidden"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 rounded-lg transition"
        >
          {loading ? "در حال صدور..." : "صدور گواهی"}
        </button>
      </form>
    </div>
  );
}
