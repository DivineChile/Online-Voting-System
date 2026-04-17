import { useState } from 'react';
import { useAuth } from '../../contexts/auth-context';
import { createAdminManagedUser } from '../../api/adminUserApi';

function CreateUserPage() {
  const { session } = useAuth();

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'student',
    department: '',
    matric_no: '',
    is_eligible: true,
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const payload = {
        ...formData,
        matric_no: formData.role === 'student' ? formData.matric_no : null,
        is_eligible: formData.role === 'student' ? formData.is_eligible : false,
      };

      const result = await createAdminManagedUser(
        session?.access_token,
        payload
      );

      setSuccessMessage(result.message || 'User created successfully.');

      setFormData({
        full_name: '',
        email: '',
        password: '',
        role: 'student',
        department: '',
        matric_no: '',
        is_eligible: true,
      });
    } catch (error) {
      setErrorMessage(error.message || 'Failed to create user.');
    } finally {
      setSubmitting(false);
    }
  }

  const isStudent = formData.role === 'student';

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-3xl mx-auto rounded-2xl bg-white shadow-md p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Create User</h1>
          <p className="mt-2 text-slate-600">
            Create a new admin, student, or election officer account.
          </p>
        </div>

        {errorMessage ? (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : null}

        {successMessage ? (
          <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {successMessage}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Full name
            </label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              placeholder="Enter full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              placeholder="user@school.edu.ng"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Temporary password
            </label>
            <input
              type="text"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              placeholder="Enter temporary password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500 bg-white"
            >
              <option value="student">Student</option>
              <option value="admin">Admin</option>
              <option value="election_officer">Election Officer</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Department
            </label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              placeholder="Enter department"
            />
          </div>

          {isStudent ? (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Matric number
                </label>
                <input
                  type="text"
                  name="matric_no"
                  value={formData.matric_no}
                  onChange={handleChange}
                  required={isStudent}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                  placeholder="Enter matric number"
                />
              </div>

              <div className="flex items-center gap-3 pt-9">
                <input
                  id="is_eligible"
                  type="checkbox"
                  name="is_eligible"
                  checked={formData.is_eligible}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-slate-300"
                />
                <label htmlFor="is_eligible" className="text-sm text-slate-700">
                  Eligible to vote
                </label>
              </div>
            </>
          ) : null}

          <div className="md:col-span-2 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full md:w-auto rounded-xl bg-slate-900 px-6 py-3 text-white font-medium disabled:opacity-60"
            >
              {submitting ? 'Creating user...' : 'Create user'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateUserPage;