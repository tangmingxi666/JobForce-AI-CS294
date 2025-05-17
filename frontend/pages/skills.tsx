import { useState } from 'react';
import { useRouter } from 'next/router';

export default function SkillsPage() {
  const router = useRouter();
  const [skills, setSkills] = useState<string[]>(['']);

  const addSkill = () => {
    setSkills([...skills, '']);
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handleSkillChange = (index: number, value: string) => {
    const newSkills = [...skills];
    newSkills[index] = value;
    setSkills(newSkills);
  };

  const handleNext = () => {

    localStorage.setItem('skills', JSON.stringify(skills.filter(skill => skill.trim() !== '')));

    router.push('/work-experience');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex gap-8">
      {/* Sidebar */}
      <div className="w-1/4 bg-white rounded shadow p-4">
        <ul className="space-y-4 text-gray-600 text-sm">
          <li>Basic Info</li>
          <li className="text-emerald-600 font-semibold">Professional Skills</li>
          <li>Work Experience</li>
          <li>Projects</li>
          <li>Education</li>
        </ul>
      </div>

      {/* Form */}
      <div className="flex-1 bg-white rounded shadow p-8">
        <h2 className="text-xl font-bold mb-6">Professional Skills</h2>

        <div className="space-y-4">
          {skills.map((skill, index) => (
            <div key={index} className="flex gap-2">
              <input
                value={skill}
                onChange={(e) => handleSkillChange(index, e.target.value)}
                className="flex-1 border border-gray-300 px-3 py-2 rounded-md"
                placeholder="Enter your skills, e.g., Python, Java, React, etc."
              />
              <button
                onClick={() => removeSkill(index)}
                className="text-emerald-500 hover:text-emerald-700"
              >
                Delete
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={addSkill}
          className="mt-4 text-emerald-500 hover:text-emerald-700"
        >
          + Add Skill
        </button>

        <div className="mt-6 flex justify-end gap-4">
          <button 
            onClick={() => router.push('/')}
            className="bg-gray-200 px-4 py-2 rounded"
          >
            Previous
          </button>
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