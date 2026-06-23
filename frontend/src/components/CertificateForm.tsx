"use client";

import { useState, useRef } from "react";

interface CertificateFormProps {
  onSubmit: (data: FormData) => Promise<void>;
  loading: boolean;
}

export default function CertificateForm({
  onSubmit,
  loading,
}: CertificateFormProps) {
  const [certPreview, setCertPreview] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const certInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleFilePreview = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (url: string | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) setter(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current) return;
    const fd = new FormData(formRef.current);
    await onSubmit(fd);
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            نام صادرکننده
          </label>
          <input
            type="text"
            name="issuer_name"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm"
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
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm"
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
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm"
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
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm"
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
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          تصویر گواهی
        </label>
        <div
          onClick={() => certInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition"
        >
          {certPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={certPreview}
              alt="preview"
              className="max-h-48 mx-auto rounded"
            />
          ) : (
            <p className="text-sm text-gray-500">کلیک کنید یا فایل را بکشید</p>
          )}
        </div>
        <input
          ref={certInputRef}
          type="file"
          name="certificate_image"
          accept="image/*"
          onChange={(e) => handleFilePreview(e, setCertPreview)}
          className="hidden"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          لوگوی صادرکننده (اختیاری)
        </label>
        <div
          onClick={() => logoInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 transition"
        >
          {logoPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoPreview}
              alt="logo preview"
              className="max-h-20 mx-auto rounded"
            />
          ) : (
            <p className="text-sm text-gray-500">لوگو (اختیاری)</p>
          )}
        </div>
        <input
          ref={logoInputRef}
          type="file"
          name="issuer_logo"
          accept="image/*"
          onChange={(e) => handleFilePreview(e, setLogoPreview)}
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
  );
}
