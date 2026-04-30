import { useEffect, useState } from 'react';
import {
  UserPlus,
  UserCheck,
  GraduationCap,
  Briefcase,
  Image as ImageIcon,
  ScrollText,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  FileText,
} from 'lucide-react';
import { useAuth } from '../../contexts/auth-context';
import {
  fetchPositionsByElection,
  createCandidate,
} from '../../api/adminCandidateApi';
import { fetchAdminElections } from '../../api/adminElectionApi';

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
            Create Candidate
          </h1>

          <p className="mt-2 max-w-3xl text-sm md:text-[15px] leading-relaxed text-gray-500">
            Register a candidate under a position for a selected election. Candidates should be added while the election is still in draft mode.
          </p>
        </div>

        <div className="rounded-xl border border-[#E6F1FB] bg-[#F5FAFF] px-4 py-3 md:max-w-[250px]">
          <p className="text-[11px] uppercase tracking-[0.08em] text-[#185FA5]">
            Candidate setup
          </p>
          <p className="mt-1 text-sm text-gray-700">
            Candidate records become part of the election setup and should be reviewed before activation.
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
  rows = 5,
}) {
  return (
    <div>
      <label className="block text-[12px] font-medium text-gray-600 mb-1.5">
        {label}
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

export default function CreateCandidatePage() {
  const { session } = useAuth();

  const [elections, setElections] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loadingElections, setLoadingElections] = useState(true);
  const [loadingPositions, setLoadingPositions] = useState(false);

  const [formData, setFormData] = useState({
    election_id: '',
    position_id: '',
    full_name: '',
    matric_no: '',
    department: '',
    level: '',
    manifesto: '',
    image_url: '',
  });

  const [loading, setLoading] = useState(false);
  const [pageMessage, setPageMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function loadElections() {
      try {
        const result = await fetchAdminElections(session?.access_token);
        setElections(result.data || []);
      } catch (error) {
        setErrorMessage(error.message || 'Failed to load elections.');
      } finally {
        setLoadingElections(false);
      }
    }

    if (session?.access_token) {
      loadElections();
    }
  }, [session]);

  useEffect(() => {
    async function loadPositions() {
      if (!formData.election_id) {
        setPositions([]);
        return;
      }

      try {
        setLoadingPositions(true);
        const result = await fetchPositionsByElection(
          session?.access_token,
          formData.election_id
        );
        setPositions(result.data || []);
      } catch (error) {
        setErrorMessage(error.message || 'Failed to load positions.');
        setPositions([]);
      } finally {
        setLoadingPositions(false);
      }
    }

    if (session?.access_token) {
      loadPositions();
    }
  }, [session, formData.election_id]);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'election_id' ? { position_id: '' } : {}),
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
        matric_no: formData.matric_no || null,
        department: formData.department || null,
        level: formData.level || null,
        manifesto: formData.manifesto || null,
        image_url: formData.image_url || null,
      };

      const result = await createCandidate(session?.access_token, payload);

      setPageMessage(result.message || 'Candidate created successfully.');
      setFormData({
        election_id: '',
        position_id: '',
        full_name: '',
        matric_no: '',
        department: '',
        level: '',
        manifesto: '',
        image_url: '',
      });
      setPositions([]);
    } catch (error) {
      setErrorMessage(error.message || 'Failed to create candidate.');
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
            <h2 className="text-lg font-semibold">Election and position</h2>
          </div>

          <p className="mt-2 text-sm text-gray-500">
            Select the election and position this candidate should belong to.
          </p>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-medium text-gray-600 mb-1.5">
                Election <span className="text-red-500">*</span>
              </label>
              <select
                name="election_id"
                value={formData.election_id}
                onChange={handleChange}
                disabled={loadingElections}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-[#534AB7]"
              >
                <option value="">
                  {loadingElections ? 'Loading elections...' : 'Select an election'}
                </option>
                {elections.map((election) => (
                  <option key={election.id} value={election.id}>
                    {election.title} ({election.status})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-gray-600 mb-1.5">
                Position <span className="text-red-500">*</span>
              </label>
              <select
                name="position_id"
                value={formData.position_id}
                onChange={handleChange}
                disabled={!formData.election_id || loadingPositions}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-[#534AB7]"
              >
                <option value="">
                  {!formData.election_id
                    ? 'Select an election first'
                    : loadingPositions
                    ? 'Loading positions...'
                    : 'Select a position'}
                </option>
                {positions.map((position) => (
                  <option key={position.id} value={position.id}>
                    {position.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-2 text-gray-900">
            <UserPlus size={18} />
            <h2 className="text-lg font-semibold">Candidate profile</h2>
          </div>

          <p className="mt-2 text-sm text-gray-500">
            Enter the candidate’s identity and academic information.
          </p>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Full name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Enter full name"
              icon={UserCheck}
              required
            />

            <InputField
              label="Matric number"
              name="matric_no"
              value={formData.matric_no}
              onChange={handleChange}
              placeholder="Enter matric number"
              icon={GraduationCap}
            />

            <InputField
              label="Department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              placeholder="Enter department"
              icon={Briefcase}
            />

            <InputField
              label="Level"
              name="level"
              value={formData.level}
              onChange={handleChange}
              placeholder="Enter level"
              icon={GraduationCap}
            />
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-2 text-gray-900">
            <ScrollText size={18} />
            <h2 className="text-lg font-semibold">Candidate content</h2>
          </div>

          <p className="mt-2 text-sm text-gray-500">
            Add manifesto text and optional image URL for the candidate profile.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4">
            <TextAreaField
              label="Manifesto"
              name="manifesto"
              value={formData.manifesto}
              onChange={handleChange}
              placeholder="Write the candidate manifesto"
            />

            <InputField
              label="Image URL"
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
              placeholder="Enter candidate image URL"
              icon={ImageIcon}
            />
          </div>

          <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 px-4 py-4">
            <p className="text-sm font-medium text-gray-900">Candidate note</p>
            <p className="mt-1 text-xs leading-relaxed text-gray-500">
              Candidates are created as active by default in the current draft election flow and can later be reviewed from the setup page.
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Create candidate
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                Review the candidate details carefully before saving.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#534AB7] px-5 py-3 text-sm font-medium text-white shadow-[0_4px_16px_rgba(83,74,183,.24)] transition hover:bg-[#433a99] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
            >
              <UserPlus size={16} />
              {loading ? 'Creating candidate...' : 'Create Candidate'}
            </button>
          </div>
        </section>
      </form>
    </div>
  );
}