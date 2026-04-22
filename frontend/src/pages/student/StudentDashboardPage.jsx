import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Vote,
  BarChart2,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  UserCircle2,
} from 'lucide-react';
import { useAuth } from '../../contexts/auth-context';
import { fetchActiveElectionForStudent } from '../../api/studentVotingApi';

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

function InfoBanner({ type = 'info', children }) {
  const styles = {
    info: 'border-slate-200 bg-slate-50 text-slate-700',
    success: 'border-green-200 bg-green-50 text-green-700',
    warning: 'border-amber-200 bg-amber-50 text-amber-700',
    error: 'border-red-200 bg-red-50 text-red-700',
  };

  const Icon =
    type === 'success'
      ? CheckCircle2
      : type === 'warning'
      ? AlertCircle
      : type === 'error'
      ? AlertCircle
      : ShieldCheck;

  return (
    <div className={`rounded-xl border px-4 py-3 text-sm ${styles[type] || styles.info}`}>
      <div className="flex items-start gap-2.5">
        <Icon size={16} className="mt-0.5 flex-shrink-0" />
        <div>{children}</div>
      </div>
    </div>
  );
}

function QuickStats({ profile, electionData, loadingElection }) {
  const items = [
    {
      label: 'Account status',
      value: profile?.is_active ? 'Active' : 'Inactive',
      highlight: profile?.is_active ? 'text-[#0F6E56]' : 'text-red-700',
    },
    {
      label: 'Voting eligibility',
      value: profile?.is_eligible ? 'Eligible' : 'Not eligible',
      highlight: profile?.is_eligible ? 'text-[#534AB7]' : 'text-red-700',
    },
    {
      label: 'Open election',
      value: loadingElection
        ? '...'
        : electionData?.election
        ? 'Available'
        : 'None',
      highlight: electionData?.election ? 'text-[#534AB7]' : '',
    },
    {
      label: 'Voting status',
      value: loadingElection
        ? '...'
        : electionData?.has_voted
        ? 'Submitted'
        : electionData?.election
        ? 'Pending'
        : '—',
      highlight: electionData?.has_voted ? 'text-[#0F6E56]' : '',
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

function ElectionStatusCard({ electionData, loadingElection }) {
  if (loadingElection) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-500">Loading election status...</p>
      </div>
    );
  }

  if (!electionData?.election) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-[11px] font-medium text-gray-400 tracking-widest uppercase">
          Current election
        </p>
        <h2 className="mt-3 text-lg font-semibold text-gray-900">
          No election currently open
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          There is no election available for voting right now. Check back later or wait for an election to be opened by the institution.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-[11px] font-medium text-gray-400 tracking-widest uppercase">
            Current election
          </p>
          <h2 className="mt-3 text-lg font-semibold text-gray-900">
            {electionData.election.title}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-500 max-w-2xl">
            {electionData.election.description || 'No description provided.'}
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 rounded-full border border-[#C0DD97] bg-[#EAF3DE] px-3 py-1 text-[11px] font-medium text-[#3B6D11]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#639922] animate-pulse" />
          Voting open
        </div>
      </div>

      <div className="mt-5">
        {electionData.has_voted ? (
          <InfoBanner type="success">
            You have already submitted your ballot for this election.
          </InfoBanner>
        ) : (
          <InfoBanner type="info">
            Your ballot is still pending. You can proceed to the voting page and make one selection for each position.
          </InfoBanner>
        )}
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
            Student profile
          </p>
          <p className="mt-1 text-[15px] font-medium text-gray-900">
            {profile?.full_name || 'Student'}
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
          <p className="text-[11px] text-gray-400">Matric number</p>
          <p className="text-sm text-gray-700">
            {profile?.matric_no || '—'}
          </p>
        </div>

        <div>
          <p className="text-[11px] text-gray-400">Department</p>
          <p className="text-sm text-gray-700">
            {profile?.department || '—'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function StudentDashboardPage() {
  const { profile, session } = useAuth();
  const [electionData, setElectionData] = useState(null);
  const [loadingElection, setLoadingElection] = useState(true);

  useEffect(() => {
    async function loadElectionState() {
      try {
        const result = await fetchActiveElectionForStudent(session?.access_token);
        setElectionData(result.data || null);
      } catch {
        setElectionData(null);
      } finally {
        setLoadingElection(false);
      }
    }

    if (session?.access_token) {
      loadElectionState();
    }
  }, [session]);

  const quickActions = useMemo(
    () => [
      {
        title: 'Go to voting page',
        description: 'Open the active election and cast your ballot securely.',
        icon: Vote,
        to: '/student/vote',
        tone: 'indigo',
      },
      {
        title: 'View published results',
        description: 'See officially published election outcomes when available.',
        icon: BarChart2,
        to: '/student/results',
        tone: 'green',
      },
      {
        title: 'Review election status',
        description: 'Check whether there is currently an election open for voting.',
        icon: ShieldCheck,
        to: '/student/vote',
        tone: 'amber',
      },
    ],
    []
  );

  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <h1 className="text-[20px] font-medium text-gray-900 mb-1">
          Welcome back, {profile?.full_name || 'Student'}
        </h1>
        <p className="text-[13px] text-gray-500">
          Access your election portal, track voting availability, and view published results.
        </p>
      </div>

      <QuickStats
        profile={profile}
        electionData={electionData}
        loadingElection={loadingElection}
      />

      <div className="mt-6 grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
        <div className="space-y-5">
          <ElectionStatusCard
            electionData={electionData}
            loadingElection={loadingElection}
          />

          <div>
            <p className="text-[11px] font-medium text-gray-400 tracking-widest uppercase mb-3">
              Quick actions
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {quickActions.map((action) => (
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