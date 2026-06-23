interface VerifyResultProps {
  valid: boolean;
  status: string;
  holderName?: string;
  holderFamily?: string;
  issuerName?: string;
  certificateTitle?: string;
  issueDate?: string;
  revokeReason?: string | null;
  certificateImageUrl?: string | null;
  issuerLogoUrl?: string | null;
}

export default function VerifyResult({
  valid,
  status,
  holderName,
  holderFamily,
  issuerName,
  certificateTitle,
  issueDate,
  revokeReason,
  certificateImageUrl,
  issuerLogoUrl,
}: VerifyResultProps) {
  if (status === "tampered") {
    return (
      <div className="text-center p-8">
        <div className="inline-block px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-bold">
          گواهی جعلی یا دستکاری‌شده
        </div>
      </div>
    );
  }

  if (status === "revoked") {
    return (
      <div className="text-center p-8">
        <div className="inline-block px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-bold mb-4">
          گواهی لغو شده
        </div>
        {revokeReason && (
          <p className="text-sm text-red-600 mt-2">دلیل: {revokeReason}</p>
        )}
      </div>
    );
  }

  if (valid) {
    return (
      <div className="p-8">
        <div className="text-center mb-6">
          <div className="inline-block px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-bold">
            گواهی معتبر
          </div>
        </div>
        {issuerLogoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={issuerLogoUrl}
            alt="logo"
            className="max-h-16 mx-auto mb-4"
          />
        )}
        <div className="space-y-2 text-sm">
          <p>
            <span className="text-gray-500">نام:</span> {holderName}{" "}
            {holderFamily}
          </p>
          <p>
            <span className="text-gray-500">صادرکننده:</span> {issuerName}
          </p>
          <p>
            <span className="text-gray-500">عنوان:</span> {certificateTitle}
          </p>
          <p>
            <span className="text-gray-500">تاریخ صدور:</span> {issueDate}
          </p>
        </div>
        {certificateImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={certificateImageUrl}
            alt="certificate"
            className="w-full mt-6 rounded-lg border"
          />
        )}
      </div>
    );
  }

  return null;
}
