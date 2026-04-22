import { useState } from 'react';
import {
  CalendarRange,
  FileText,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../contexts/auth-context';
import { createElection } from '../../api/adminElectionApi';

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
            Create Election
          </h1>

          <p className="mt-2 max-w-3xl text-sm md:text-[15px] leading-relaxed text-gray-500">
            Set up a new election in draft mode. After creation, you can add positions, candidates, and review the setup before activation.
          </p>
        </div>

        <div className="rounded-xl border border-[#E6F1FB] bg-[#F5FAFF] px-4 py-3 md:max-w-[250px]">
          <p className="text-[11px] uppercase tracking-[0.08em] text-[#185FA5]">
            Election flow
          </p>
          <p className="mt-1 text-sm text-gray-700">
            New elections begin as draft records and should only be activated when fully prepared.
          </p>
        </div>
      </div>
    </div>
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

function TextAreaField({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  rows = 5,
}) {
  return (
    <div>
      <label className="block text-[12px] font-medium text-gray-600 mb-1.5">
        {label} {required ? <span className="text-red-500">*</span> : null}
      </label>

      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows={rows}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-[#534AB7]"
      />
    </div>
  );
}

export default function CreateElectionPage() {
  const { session } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
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

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);
    setPageMessage('');
    setErrorMessage('');

    try {
      const payload = {
        ...formData,
        start_time: new Date(formData.start_time).toISOString(),
        end_time: new Date(formData.end_time).toISOString(),
      };

      const result = await createElection(session?.access_token, payload);

      setPageMessage(result.message || 'Election created successfully.');
      setFormData({
        title: '',
        description: '',
        start_time: '',
        end_time: '',
      });
    } catch (error) {
      setErrorMessage(error.message || 'Failed to create election.');
    } finally {
      setLoading(false);
    }
  }

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
            <FileText size={18} />
            <h2 className="text-lg font-semibold">Election details</h2>
          </div>

          <p className="mt-2 text-sm text-gray-500">
            Enter the main information for this election.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4">
            <InputField
              label="Election title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter election title"
              icon={FileText}
              required
            />

            <TextAreaField
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Write a short description for the election"
            />
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-2 text-gray-900">
            <CalendarRange size={18} />
            <h2 className="text-lg font-semibold">Election schedule</h2>
          </div>

          <p className="mt-2 text-sm text-gray-500">
            Define when voting should begin and end.
          </p>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Start time"
              name="start_time"
              type="datetime-local"
              value={formData.start_time}
              onChange={handleChange}
              icon={CalendarRange}
              required
            />

            <InputField
              label="End time"
              name="end_time"
              type="datetime-local"
              value={formData.end_time}
              onChange={handleChange}
              icon={CalendarRange}
              required
            />
          </div>

          <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 px-4 py-4">
            <p className="text-sm font-medium text-gray-900">Important note</p>
            <p className="mt-1 text-xs leading-relaxed text-gray-500">
              After creation, this election remains in draft mode until you activate it from the Manage Elections page.
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Create election
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                Review the details carefully before saving this election.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#534AB7] px-5 py-3 text-sm font-medium text-white shadow-[0_4px_16px_rgba(83,74,183,.24)] transition hover:bg-[#433a99] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
            >
              <PlusCircle size={16} />
              {loading ? 'Creating election...' : 'Create Election'}
            </button>
          </div>
        </section>
      </form>
    </div>
  );
}