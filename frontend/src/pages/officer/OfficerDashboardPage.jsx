import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Vote,
  BarChart3,
  ClipboardList,
  CheckCircle2,
  AlertCircle,
  UserCircle2,
} from 'lucide-react';
import { useAuth } from '../../contexts/auth-context';
import { fetchOfficerDashboardSummary } from '../../api/officerApi';

function ActionCard({ title, description, icon: Icon, to, tone = 'indigo' }) {
  const navigate = useNavigate();

  const toneStyles = {
    indigo: {
      iconWrap: 'bg-[#EEEDFE]',
      icon: 'text-[#534AB7]',
    },
    green: {
      iconWrap: 'bg-[#E1F5EE]',
      icon: 'text-[#0F6E56]',
    },
    amber: {
      iconWrap: 'bg-[#FAECE7]',
      icon: 'text-[#993C1D]',
    },
  };

  const styles = toneStyles[tone] || toneStyles.indigo;

  return (
    <button
      onClick={() => navigate(to)}
      className="text-left bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-3 hover:border-gray-300 hover:bg-gray-50 hover:-translate-y-px active:scale-[.99] transition-all duration-150 min-h-[150px]"
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${styles.iconWrap}`}>
        <Icon size={18} className={styles.icon} strokeWidth={1.7} />
      </div>

      <div>
        <p className="text-[15px] font-medium text-gray-900">{title}</p>
        <p className="mt-1 text-[12.5px] leading-relaxed text-gray-500">
          {description}
        </p>
      </div>
    </button>
  );
}

function QuickStats({ activeElection, loading }) {
  const items = [
    {
      label: 'Officer access',
      value: 'Read-only',
      highlight: 'text-[#534AB7]',
    },
    {
      label: 'Active election',
      value: loading ? '...' : activeElection ? 'Available' : 'None',
      highlight: activeElection ? 'text-[#0F6E56]' : '',
    },
    {
      label: 'Monitoring mode',
      value: 'Enabled',
      highlight: '',
    },
    {
      label: 'Results access',
      value: 'Published only',
      highlight: '',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
      {items.map((item) => (
        <div key={item.label} className="rounded-xl bg-gray-100 px-4 py-3.5">
          <p className="text-[11px] text-gray-500 mb-1.5">{item.label}</p>
          <p className={`text-[20px] font-medium ${item.highlight || 'text-gray-900'}`}>
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}

function StatusBanner({ activeElection, loading, errorMessage }) {
  if (errorMessage) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        <div className="flex items-start gap-2.5">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <div>{errorMessage}</div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-500">Loading dashboard summary...</p>
      </div>
    );
  }

  if (!activeElection) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-[11px] font-medium text-gray-400 tracking-widest uppercase">
          Current election
        </p>
        <h2 className="mt-3 text-lg font-semibold text-gray-900">
          No active election available
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          There is currently no election open for monitoring.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#C0DD97] bg-[#EAF3DE] px-3 py-1 text-[11px] font-medium text-[#3B6D11]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#639922] animate-pulse" />
            Monitoring active
          </div>

          <h2 className="mt-4 text-lg font-semibold text-gray-900">
            {activeElection.title}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-500 max-w-2xl">
            {activeElection.description || 'No description provided.'}
          </p>
        </div>

        <div className="rounded-xl border border-[#EEEDFE] bg-[#F7F6FF] px-4 py-3 md:max-w-[240px]">
          <p className="text-[11px] uppercase tracking-[0.08em] text-[#6C63C9]">
            Officer role
          </p>
          <p className="mt-1 text-sm text-gray-700">
            You can review the election, monitor setup, and access published results.
          </p>
        </div>
      </div>
    </div>
  );
}

function ProfileCard({ profile }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-[#EEEDFE] flex items-center justify-center text-[#534AB7]">
          <UserCircle2 size={22} />
        </div>
        <div>
          <p className="text-[11px] font-medium text-gray-400 tracking-widest uppercase">
            Officer profile
          </p>
          <p className="mt-1 text-[15px] font-medium text-gray-900">
            {profile?.full_name || 'Election Officer'}
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <div>
          <p className="text-[11px] text-gray-400">Email</p>
          <p className="text-sm text-gray-700 break-all">
            {profile?.email || '—'}
          </p>
        </div>

        <div>
          <p className="text-[11px] text-gray-400">Role</p>
          <p className="text-sm text-gray-700">Election Officer</p>
        </div>

        <div>
          <p className="text-[11px] text-gray-400">Access type</p>
          <p className="text-sm text-gray-700">Oversight / Read-only</p>
        </div>
      </div>
    </div>
  );
}

export default function OfficerDashboardPage() {
  const { profile, session } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function loadSummary() {
      try {
        const result = await fetchOfficerDashboardSummary(session?.access_token);
        setSummary(result.data || null);
      } catch (error) {
        setErrorMessage(error.message || 'Failed to load dashboard summary.');
      } finally {
        setLoading(false);
      }
    }

    if (session?.access_token) {
      loadSummary();
    }
  }, [session]);

  const actions = useMemo(
    () => [
      {
        title: 'View active election',
        description: 'Monitor the currently open election and participating candidates.',
        icon: Vote,
        to: '/officer/election',
        tone: 'indigo',
      },
      {
        title: 'Review setup',
        description: 'Inspect positions and candidates in read-only mode.',
        icon: ClipboardList,
        to: '/officer/setup',
        tone: 'amber',
      },
      {
        title: 'View published results',
        description: 'See officially published election outcomes when available.',
        icon: BarChart3,
        to: '/officer/results',
        tone: 'green',
      },
    ],
    []
  );

  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <h1 className="text-[20px] font-medium text-gray-900 mb-1">
          Welcome back, {profile?.full_name || 'Election Officer'}
        </h1>
        <p className="text-[13px] text-gray-500">
          Monitor elections, review setup, and follow published results from one place.
        </p>
      </div>

      <QuickStats activeElection={summary?.active_election} loading={loading} />

      <div className="mt-6 grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
        <div className="space-y-5">
          <StatusBanner
            activeElection={summary?.active_election}
            loading={loading}
            errorMessage={errorMessage}
          />

          <div>
            <p className="text-[11px] font-medium text-gray-400 tracking-widest uppercase mb-3">
              Quick actions
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {actions.map((action) => (
                <ActionCard key={action.title} {...action} />
              ))}
            </div>
          </div>
        </div>

        <ProfileCard profile={profile} />
      </div>
    </div>
  );
}