import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { verifyEmail } from '@/services/auth.service';
import { CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided.');
      return;
    }

    const verify = async () => {
      try {
        const res = await verifyEmail(token);
        setStatus('success');
        setMessage(res.message || 'Your email has been verified successfully.');
      } catch (err) {
        setStatus('error');
        setMessage(err?.response?.data?.message || 'Verification failed. The link may be expired.');
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-dvh flex items-center justify-center bg-[#FAF7F5] p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 md:p-10 shadow-[0_8px_30px_rgba(30,32,34,0.04)] border border-[#F0EBE6]">
        <div className="flex flex-col items-center text-center">
          
          {status === 'loading' && (
            <>
              <div className="w-16 h-16 bg-[#D97736]/10 rounded-2xl flex items-center justify-center mb-6">
                <Loader2 className="text-[#D97736] animate-spin" size={32} />
              </div>
              <h1 className="text-2xl font-bold text-[#1E2022] tracking-tight mb-2">Verifying Email</h1>
              <p className="text-sm text-[#9CA3AF] leading-relaxed">
                Please wait while we securely verify your workspace account...
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-[#1E4620]/10 rounded-2xl flex items-center justify-center mb-6">
                <CheckCircle className="text-[#1E4620]" size={32} />
              </div>
              <h1 className="text-2xl font-bold text-[#1E2022] tracking-tight mb-2">Email Verified!</h1>
              <p className="text-sm text-[#9CA3AF] leading-relaxed mb-8">
                {message}
              </p>
              <Link
                to="/login"
                className="w-full inline-flex justify-center items-center gap-2 h-12 bg-[#1E2022] text-white text-sm font-semibold rounded-xl hover:bg-[#2D3135] transition-colors shadow-sm"
              >
                Proceed to Login
                <ArrowRight size={16} />
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-[#C85C27]/10 rounded-2xl flex items-center justify-center mb-6">
                <XCircle className="text-[#C85C27]" size={32} />
              </div>
              <h1 className="text-2xl font-bold text-[#1E2022] tracking-tight mb-2">Verification Failed</h1>
              <p className="text-sm text-[#9CA3AF] leading-relaxed mb-8">
                {message}
              </p>
              <Link
                to="/login"
                className="w-full inline-flex justify-center items-center h-12 bg-[#FAF7F5] border border-[#E8E2DC] text-[#1E2022] text-sm font-semibold rounded-xl hover:bg-[#F4EFEB] transition-colors"
              >
                Back to Login
              </Link>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
