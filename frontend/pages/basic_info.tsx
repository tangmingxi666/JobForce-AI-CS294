import { useState } from 'react';
import { useRouter } from 'next/router';

export default function ResumeForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    location: '',
    interest: '',
    website: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    localStorage.setItem('basicInfo', JSON.stringify(form));
    router.push('/skills');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex gap-8">
      {/* Sidebar */}
      <div className="w-1/4 bg-white rounded shadow p-4">
        <ul className="space-y-4 text-gray-600 text-sm">
          <li className="text-emerald-600 font-semibold">Basic Info</li>
          <li>Professional Skills</li>
          <li>Work Experience</li>
          <li>Projects</li>
          <li>Education</li>
        </ul>
      </div>

      {/* Form */}
      <div className="flex-1 bg-white rounded shadow p-8">
        <h2 className="text-xl font-bold mb-6">Basic Information</h2>

        <div className="grid grid-cols-2 gap-6">
          {[
            { label: 'Name', key: 'name' },
            { label: 'Phone', key: 'phone' },
            { label: 'Email', key: 'email' },
            { label: 'Location', key: 'location' },
          ].map(({ label, key }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700">
                * {label}
              </label>
              <input
                name={key}
                value={form[key as keyof typeof form]}
                onChange={handleChange}
                className="mt-1 w-full border border-emerald-300 px-3 py-2 rounded-md focus:outline-none"
                placeholder={`Enter your ${label.toLowerCase()}`}
              />
            </div>
          ))}

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Personal Website
            </label>
            <input
              name="website"
              value={form.website}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-300 px-3 py-2 rounded-md"
              placeholder="https://example.com"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <button className="bg-gray-200 px-4 py-2 rounded">Save</button>
          <button
            onClick={handleNext}
            className="bg-emerald-600 text-white px-6 py-2 rounded hover:bg-emerald-700"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
