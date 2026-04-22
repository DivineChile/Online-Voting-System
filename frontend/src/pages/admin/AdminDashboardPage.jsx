import { useEffect, useMemo, useState } from "react";
import {
  Users,
  FileText,
  Clock,
  UserCheck,
  BarChart2,
  ScrollText,
  ClipboardCheck,
  PlusCircle,
} from "lucide-react";
import { useAuth } from "../../contexts/auth-context";
import { fetchAdminDashboardSummary } from "../../api/adminDashboardApi";
import ElectionOverview from "../../components/common/ElectionOverview";
import QuickActionCard from "../../components/common/QuickActionCard";
import StatCards from "../../components/common/StatCards";

export default function AdminDashboardPage() {
  const { profile, session } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    stats: null,
    elections_overview: [],
  });
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const quickActions = useMemo(
    () => [
      {
        label: "Create user",
        desc: "Add student or officer",
        icon: Users,
        iconBg: "bg-[#EEEDFE]",
        iconColor: "text-[#534AB7]",
        to: "/admin/users/create",
      },
      {
        label: "Create election",
        desc: "Set up a new election",
        icon: FileText,
        iconBg: "bg-[#EEEDFE]",
        iconColor: "text-[#534AB7]",
        to: "/admin/elections/create",
      },
      {
        label: "Create position",
        desc: "Add roles to an election",
        icon: Clock,
        iconBg: "bg-[#E1F5EE]",
        iconColor: "text-[#0F6E56]",
        to: "/admin/positions/create",
      },
      {
        label: "Add candidate",
        desc: "Register for a position",
        icon: UserCheck,
        iconBg: "bg-[#E1F5EE]",
        iconColor: "text-[#0F6E56]",
        to: "/admin/candidates/create",
      },
      {
        label: "Review setup",
        desc: "Confirm readiness",
        icon: ClipboardCheck,
        iconBg: "bg-[#FAECE7]",
        iconColor: "text-[#993C1D]",
        to: "/admin/elections/setup",
      },
      {
        label: "View results",
        desc: "Published outcomes",
        icon: BarChart2,
        iconBg: "bg-[#E6F1FB]",
        iconColor: "text-[#185FA5]",
        to: "/admin/results",
      },
      {
        label: "Audit logs",
        desc: "Activity records",
        icon: ScrollText,
        iconBg: "bg-[#FAECE7]",
        iconColor: "text-[#993C1D]",
        to: "/admin/audit-logs",
      },
      {
        label: "Manage elections",
        desc: "Edit, open, or close",
        icon: PlusCircle,
        iconBg: "bg-[#E6F1FB]",
        iconColor: "text-[#185FA5]",
        to: "/admin/elections",
      },
    ],
    []
  );

  useEffect(() => {
    async function loadDashboardSummary() {
      try {
        setErrorMessage("");
        const result = await fetchAdminDashboardSummary(session?.access_token);
        setDashboardData(result.data || { stats: null, elections_overview: [] });
      } catch (error) {
        setErrorMessage(error.message || "Failed to load dashboard summary.");
      } finally {
        setLoading(false);
      }
    }

    if (session?.access_token) {
      loadDashboardSummary();
    }
  }, [session]);

  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <h1 className="text-[20px] font-medium text-gray-900 mb-1">
          Welcome back, {profile?.full_name || "Administrator"}
        </h1>
        <p className="text-[13px] text-gray-500">
          Here's a summary of your election platform.
        </p>
      </div>

      {errorMessage ? (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      <StatCards stats={dashboardData.stats} loading={loading} />

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-5">
        <div>
          <p className="text-[11px] font-medium text-gray-400 tracking-widest uppercase mb-3">
            Quick actions
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3">
            {quickActions.map((action) => (
              <QuickActionCard key={action.label} action={action} />
            ))}
          </div>
        </div>

        <ElectionOverview
          elections={dashboardData.elections_overview || []}
          loading={loading}
        />
      </div>
    </div>
  );
}