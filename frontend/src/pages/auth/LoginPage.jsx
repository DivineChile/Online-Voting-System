import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, ShieldCheck, Vote } from "lucide-react";
import { useAuth } from "../../contexts/auth-context";

export default function LoginPage() {
  const navigate = useNavigate();
  const { signIn, profile, isAuthenticated, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const canSubmit = email.trim().length > 0 && password.length > 0;

  useEffect(() => {
    if (loading) return;

    if (isAuthenticated && profile) {
      if (profile.role === "admin") {
        navigate("/admin", { replace: true });
        return;
      }

      if (profile.role === "student") {
        navigate("/student", { replace: true });
        return;
      }

      if (profile.role === "election_officer") {
        navigate("/officer", { replace: true });
      }
    }
  }, [loading, isAuthenticated, profile, navigate]);

  async function handleLogin(event) {
    event.preventDefault();

    if (!canSubmit || isSubmitting) return;

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await signIn({
        email: email.trim(),
        password,
      });
    } catch (error) {
      setErrorMessage(error.message || "Login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-4xl flex rounded-2xl overflow-hidden shadow-sm border border-gray-200 bg-white">
        <div className="hidden md:flex flex-col justify-between w-5/12 bg-[#26215C] px-10 py-10 relative overflow-hidden">
          <div className="absolute -top-14 -right-14 w-48 h-48 rounded-full border border-white/5" />
          <div className="absolute -top-4 -right-4 w-28 h-28 rounded-full border border-white/[0.07]" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full border border-white/[0.05]" />

          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-9 h-9 bg-[#534AB7] rounded-lg flex items-center justify-center flex-shrink-0">
                <Vote size={18} color="#EEEDFE" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-[#EEEDFE] text-sm font-medium leading-tight">
                  Student Voting System
                </p>
                <p className="text-white/40 text-[11px] tracking-wide">
                  Election Portal
                </p>
              </div>
            </div>

            <h1 className="text-[#EEEDFE] text-xl font-medium leading-snug mb-3">
              Secure student elections for your institution
            </h1>
            <p className="text-white/50 text-[13px] leading-relaxed">
              A transparent, one-vote-per-student platform designed to empower
              campus democracy.
            </p>
          </div>

          <ul className="space-y-3">
            {[
              "One verified vote per eligible student",
              "Admin-controlled elections and results",
              "Auditable and tamper-evident records",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-md bg-white/[0.08] flex items-center justify-center flex-shrink-0 mt-[1px]">
                  <svg width="10" height="10" viewBox="0 0 10 10">
                    <path
                      d="M1.5 5l2.5 2.5 4.5-4.5"
                      stroke="#AFA9EC"
                      strokeWidth="1.5"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span className="text-white/55 text-[12.5px] leading-[1.5]">
                  {item}
                </span>
              </li>
            ))}
          </ul>

          <div>
            <p className="text-white/30 text-[11px] tracking-widest uppercase mb-2.5">
              Access for
            </p>
            <div className="flex flex-wrap gap-2">
              {["Students", "Admins", "Election Officers"].map((role) => (
                <span
                  key={role}
                  className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#CECBF6] bg-[#CECBF6]/10 px-3 py-1 rounded-full"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#AFA9EC]/60" />
                  {role}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 bg-white px-8 py-10 flex flex-col justify-center">
          <div className="mb-7">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#3B6D11] bg-green-50 px-3 py-1 rounded-full border border-green-100">
              <span className="w-1.5 h-1.5 rounded-full bg-[#639922] animate-pulse" />
              Portal active
            </span>
          </div>

          <div className="mb-7">
            <h2 className="text-xl font-medium text-gray-900 mb-1.5">
              Sign in to your account
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              Use the credentials provided by your institution to continue.
            </p>
          </div>

          {errorMessage ? (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          ) : null}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-gray-500 tracking-wide mb-1.5">
                Institutional email
              </label>
              <input
                type="email"
                placeholder="you@polytechnic.edu.ng"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="w-full h-11 px-3.5 text-sm rounded-lg border border-gray-200 bg-white text-gray-900 placeholder-gray-400 outline-none transition focus:border-[#534AB7] focus:ring-2 focus:ring-[#534AB7]/15"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-gray-500 tracking-wide">
                  Password
                </label>
                <button
                  type="button"
                  className="text-xs text-[#534AB7] hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="w-full h-11 px-3.5 pr-11 text-sm rounded-lg border border-gray-200 bg-white text-gray-900 placeholder-gray-400 outline-none transition focus:border-[#534AB7] focus:ring-2 focus:ring-[#534AB7]/15"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={!canSubmit || isSubmitting || loading}
              className="w-full h-11 rounded-lg text-sm font-medium text-white bg-[#534AB7] transition hover:bg-[#3C3489] active:scale-[.98] disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none shadow-[0_2px_8px_rgba(83,74,183,.30)] hover:shadow-[0_4px_16px_rgba(83,74,183,.40)]"
            >
              {isSubmitting ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="mt-7 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-[12.5px] text-gray-500 leading-relaxed">
              <span className="font-medium text-gray-700">
                Access is role-based.
              </span>{" "}
              After sign-in you'll be directed to the appropriate dashboard.
              Contact your institution's admin if you have not received your
              credentials.
            </p>
          </div>

          <p className="mt-6 text-[11.5px] text-gray-400 leading-relaxed">
            This platform is restricted to authorized institutional users only.
          </p>
        </div>
      </div>
    </div>
  );
}