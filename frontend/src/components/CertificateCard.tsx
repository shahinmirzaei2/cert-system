interface CertificateCardProps {
  id: string;
  holderName: string;
  holderFamily: string;
  issuerName: string;
  certificateTitle: string;
  issueDate: string;
  status: string;
  onDownloadQr: (id: string) => void;
  onRevoke?: (id: string) => void;
}

export default function CertificateCard({
  id,
  holderName,
  holderFamily,
  issuerName,
  certificateTitle,
  issueDate,
  status,
  onDownloadQr,
  onRevoke,
}: CertificateCardProps) {
  return (
    <div className="bg-white rounded-xl border p-4 hover:shadow-md transition">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-gray-800">
            {holderName} {holderFamily}
          </h3>
          <p className="text-sm text-gray-500">{certificateTitle}</p>
        </div>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            status === "active"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {status === "active" ? "معتبر" : "لغوشده"}
        </span>
      </div>
      <div className="text-xs text-gray-500 space-y-1 mb-3">
        <p>صادرکننده: {issuerName}</p>
        <p>تاریخ صدور: {issueDate}</p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onDownloadQr(id)}
          className="text-blue-600 hover:text-blue-800 text-xs font-medium"
        >
          دانلود QR
        </button>
        {status === "active" && onRevoke && (
          <button
            onClick={() => onRevoke(id)}
            className="text-red-600 hover:text-red-800 text-xs font-medium"
          >
            لغو
          </button>
        )}
      </div>
    </div>
  );
}
