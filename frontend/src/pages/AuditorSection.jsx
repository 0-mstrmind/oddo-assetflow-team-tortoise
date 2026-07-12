import { useAuthStore } from '@/store/auth.store';
import { useEffect, useState } from 'react';
import { getAuditCycles } from '@/services/audit.service';
import { ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

export default function AuditorSection() {
  const user = useAuthStore((s) => s.user);
  const isAuditor = user?.role === 'auditor';

  const [cycles, setCycles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuditor) {
      getAuditCycles()
        .then((data) => setCycles(data))
        .catch((err) => {
          console.error(err);
          toast.error('Failed to load audit cycles');
        })
        .finally(() => setLoading(false));
    }
  }, [isAuditor]);

  if (!isAuditor) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
        <div className="w-16 h-16 bg-[#C85C27]/10 rounded-2xl flex items-center justify-center mb-6 animate-pulse">
          <ShieldAlert className="text-[#C85C27]" size={32} />
        </div>
        <h1 className="text-2xl font-bold text-[#1E2022] tracking-tight mb-2">Access Denied</h1>
        <p className="text-sm text-[#9CA3AF] text-center max-w-sm mb-6 leading-relaxed">
          This section is restricted to Auditors.
        </p>
        <a href="/dashboard" className="px-5 py-2.5 bg-[#1E2022] text-white text-sm font-semibold rounded-full hover:bg-[#2D3135] transition-all shadow-[0_2px_8px_rgba(30,32,34,0.06)]">
          Return to Dashboard
        </a>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold text-[#1E2022]">Auditor Dashboard</h2>
      {loading ? (
        <p className="text-[#9CA3AF]">Loading audit cycles...</p>
      ) : (
        <ul className="list-disc pl-5 space-y-2">
          {cycles.map((c) => (
            <li key={c._id || c.id} className="text-[#1E2022]">
              {c.name} ({c.status})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
