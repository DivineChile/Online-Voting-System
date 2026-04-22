import { useState } from 'react';
import {
  UserPlus,
  Mail,
  Lock,
  User,
  Users,
  GraduationCap,
  Briefcase,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../contexts/auth-context';
import { createAdminManagedUser } from '../../api/adminUserApi';

function StatusMessage({ type = 'info', children }) {
  const styles = {
    error: 'border-red-200 bg-red-50 text-red-700',
    success: 'border-green-200 bg-green-50 text-green-700',
    info: 'border-slate-200 bg-slate-50 text-slate-700',
  };

  const Icon =
    type === 'error'
      ? AlertCircle
      : type === 'success'
      ? CheckCircle2
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

function PageHero() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#D9D6FB] bg-[#F7F6FF] px-3 py-1 text-[11px] font-medium text-[#534AB7]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#534AB7]" />
            Admin action
          </div>

          <h1 className="mt-4 text-xl md:text-2xl font-semibold text-gray-900">
            Create User
          </h1>

          <p className="mt-2 max-w-3xl text-sm md:text-[15px] leading-relaxed text-gray-500">
            Add a new admin, student, or election officer to the platform. Users are pre-registered by the institution and do not self-register.
          </p>
        </div>

        <div className="rounded-xl border border-[#E6F1FB] bg-[#F5FAFF] px-4 py-3 md:max-w-[250px]">
          <p className="text-[11px] uppercase tracking-[0.08em] text-[#185FA5]">
            Access control
          </p>
          <p className="mt-1 text-sm text-gray-700">
            Assign the correct role carefully. Student eligibility can be controlled during account creation.
          </p>
        </div>
      </div>
    </div>
  );
}

function RoleCard({ role, selectedRole, onSelect }) {
  const roleConfig = {
    admin: {
      title: 'Admin',
      description: 'Full management access across elections, users, results, and logs.',
      icon: ShieldCheck,
      iconWrap: 'bg-[#EEEDFE]',
      iconColor: 'text-[#534AB7]',
    },
    student: {
      title: 'Student',
      description: 'Can vote once in active elections and view published results.',
      icon: GraduationCap,
      iconWrap: 'bg-[#E1F5EE]',
      iconColor: 'text-[#0F6E56]',
    },
    election_officer: {
      title: 'Election Officer',
      description: 'Read-only oversight access for setup, active election, and published results.',
      icon: Briefcase,
      iconWrap: 'bg-[#FAECE7]',
      iconColor: 'text-[#993C1D]',
    },
  };

  const config = roleConfig[role];
  const Icon = config.icon;
  const isSelected = selectedRole === role;

  return (
    <button
      type="button"
      onClick={() => onSelect(role)}
      className={`rounded-2xl border p-4 text-left transition-all duration-200 ${
        isSelected
          ? 'border-[#534AB7] bg-[#F7F6FF] ring-1 ring-[#534AB7]/10'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
      }`}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${config.iconWrap}`}>
        <Icon size={18} className={config.iconColor} strokeWidth={1.7} />
      </div>

      <p className="mt-4 text-[15px] font-medium text-gray-900">{config.title}</p>
      <p className="mt-1 text-[12.5px] leading-relaxed text-gray-500">
        {config.description}
      </p>
    </button>
  );
}

function InputField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  icon: Icon,
  required = false,
}) {
  return (
    <div>
      <label className="block text-[12px] font-medium text-gray-600 mb-1.5">
        {label} {required ? <span className="text-red-500">*</span> : null}
      </label>

      <div className="relative">
        {Icon ? (
          <Icon
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
        ) : null}

        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full rounded-xl border border-gray-200 bg-white py-3 outline-none focus:border-[#534AB7] ${
            Icon ? 'pl-10 pr-4' : 'px-4'
          }`}
        />
      </div>
    </div>
  );
}

function EligibilityToggle({ checked, onChange }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-900">Voting eligibility</p>
          <p className="mt-1 text-xs leading-relaxed text-gray-500">
            Enable this only if the student is eligible to participate in elections.
          </p>
        </div>

        <button
          type="button"
          onClick={onChange}
          className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${
            checked ? 'bg-[#534AB7]' : 'bg-gray-300'
          }`}
          aria-pressed={checked}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
              checked ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    </div>
  );
}

export default function CreateUserPage() {
  const { session } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'student',
    department: '',
    matric_no: '',
    is_eligible: true,
  });

  const [loading, setLoading] = useState(false);
  const [pageMessage, setPageMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleRoleSelect(role) {
    setFormData((prev) => ({
      ...prev,
      role,
      matric_no: role === 'student' ? prev.matric_no : '',
      is_eligible: role === 'student' ? prev.is_eligible : false,
    }));
  }

  function handleEligibilityToggle() {
    setFormData((prev) => ({
      ...prev,
      is_eligible: !prev.is_eligible,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);
    setPageMessage('');
    setErrorMessage('');

    try {
      const payload = {
        ...formData,
        department: formData.department || null,
        matric_no: formData.role === 'student' ? formData.matric_no || null : null,
        is_eligible: formData.role === 'student' ? formData.is_eligible : false,
      };

      const result = await createAdminManagedUser(session?.access_token, payload);

      setPageMessage(result.message || 'User created successfully.');
      setFormData({
        email: '',
        password: '',
        full_name: '',
        role: 'student',
        department: '',
        matric_no: '',
        is_eligible: true,
      });
    } catch (error) {
      setErrorMessage(error.message || 'Failed to create user.');
    } finally {
      setLoading(false);
    }
  }

  const isStudent = formData.role === 'student';

  return (
    <div className="max-w-5xl space-y-6">
      <PageHero />

      {errorMessage ? (
        <StatusMessage type="error">{errorMessage}</StatusMessage>
      ) : null}

      {pageMessage ? (
        <StatusMessage type="success">{pageMessage}</StatusMessage>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-2 text-gray-900">
            <Users size={18} />
            <h2 className="text-lg font-semibold">Choose user role</h2>
          </div>

          <p className="mt-2 text-sm text-gray-500">
            Select the type of account you want to create.
          </p>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <RoleCard
              role="admin"
              selectedRole={formData.role}
              onSelect={handleRoleSelect}
            />
            <RoleCard
              role="student"
              selectedRole={formData.role}
              onSelect={handleRoleSelect}
            />
            <RoleCard
              role="election_officer"
              selectedRole={formData.role}
              onSelect={handleRoleSelect}
            />
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-2 text-gray-900">
            <UserPlus size={18} />
            <h2 className="text-lg font-semibold">Account details</h2>
          </div>

          <p className="mt-2 text-sm text-gray-500">
            Enter the user’s identity and login details.
          </p>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Full name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Enter full name"
              icon={User}
              required
            />

            <InputField
              label="Email address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email address"
              icon={Mail}
              required
            />

            <InputField
              label="Temporary password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter temporary password"
              icon={Lock}
              required
            />

            <InputField
              label="Department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              placeholder="Enter department"
              icon={Briefcase}
            />
          </div>
        </section>

        {isStudent ? (
          <section className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm">
            <div className="flex items-center gap-2 text-gray-900">
              <GraduationCap size={18} />
              <h2 className="text-lg font-semibold">Student details</h2>
            </div>

            <p className="mt-2 text-sm text-gray-500">
              Student accounts require a matric number and eligibility setting.
            </p>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Matric number"
                name="matric_no"
                value={formData.matric_no}
                onChange={handleChange}
                placeholder="Enter matric number"
                icon={GraduationCap}
                required
              />
            </div>

            <div className="mt-5">
              <EligibilityToggle
                checked={formData.is_eligible}
                onChange={handleEligibilityToggle}
              />
            </div>
          </section>
        ) : null}

        <section className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Create account
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                Review the details carefully before creating this user.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#534AB7] px-5 py-3 text-sm font-medium text-white shadow-[0_4px_16px_rgba(83,74,183,.24)] transition hover:bg-[#433a99] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
            >
              <UserPlus size={16} />
              {loading ? 'Creating user...' : 'Create User'}
            </button>
          </div>
        </section>
      </form>
    </div>
  );
}