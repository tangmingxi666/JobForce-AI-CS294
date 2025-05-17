import { useState } from 'react';
import { useRouter } from 'next/router';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TextField } from '@mui/material';
import { format, parse } from 'date-fns';

type WorkExperience = {
  projectName: string;
  city: string;
  position: string;
  department: string;
  startDate: string;
  endDate: string;
  description: string;
};

export default function WorkExperiencePage() {
  const router = useRouter();
  const [experiences, setExperiences] = useState<WorkExperience[]>([{
    projectName: '',
    city: '',
    position: '',
    department: '',
    startDate: '',
    endDate: '',
    description: ''
  }]);

  const handleChange = (index: number, field: keyof WorkExperience, value: string) => {
    const newExperiences = [...experiences];
    newExperiences[index] = {
      ...newExperiences[index],
      [field]: value
    };
    setExperiences(newExperiences);
  };

  const handleNext = () => {
    localStorage.setItem('workExperience', JSON.stringify(experiences));
    router.push('/project-experience');
  };

  const addExperience = () => {
    setExperiences([...experiences, {
      projectName: '',
      city: '',
      position: '',
      department: '',
      startDate: '',
      endDate: '',
      description: ''
    }]);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex gap-8">
      {/* Sidebar */}
      <div className="w-1/4 bg-white rounded shadow p-4">
        <ul className="space-y-4 text-gray-600 text-sm">
          <li>Basic Info</li>
          <li>Professional Skills</li>
          <li className="text-emerald-600 font-semibold">Work Experience</li>
          <li>Projects</li>
          <li>Education</li>
        </ul>
      </div>

      {/* Form */}
      <div className="flex-1 bg-white rounded shadow p-8">
        <h2 className="text-xl font-bold mb-6">Work Experience</h2>

        {experiences.map((experience, index) => (
          <div key={index} className="mb-8 border-b pb-8">
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name
                </label>
                <input
                  value={experience.projectName}
                  onChange={(e) => handleChange(index, 'projectName', e.target.value)}
                  className="w-full border border-gray-300 px-3 py-2 rounded-md"
                  placeholder="Enter company name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  value={experience.city}
                  onChange={(e) => handleChange(index, 'city', e.target.value)}
                  className="w-full border border-gray-300 px-3 py-2 rounded-md"
                  placeholder="Enter city"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Position
                </label>
                <input
                  value={experience.position}
                  onChange={(e) => handleChange(index, 'position', e.target.value)}
                  className="w-full border border-gray-300 px-3 py-2 rounded-md"
                  placeholder="Enter your position"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <input
                  value={experience.department}
                  onChange={(e) => handleChange(index, 'department', e.target.value)}
                  className="w-full border border-gray-300 px-3 py-2 rounded-md"
                  placeholder="Enter department"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      views={['month', 'year']}
                      value={experience.startDate ? parse(experience.startDate, 'yyyy-MM', new Date()) : null}
                      onChange={(newValue) => {
                        handleChange(index, 'startDate', newValue ? format(newValue, 'yyyy-MM') : '');
                      }}
                      format="MM/yyyy"
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: "small",
                          sx: {
                            '& .MuiOutlinedInput-root': {
                              '& fieldset': {
                                borderColor: 'rgb(209 213 219)',
                              },
                              '&:hover fieldset': {
                                borderColor: 'rgb(156 163 175)',
                              },
                            },
                          }
                        }
                      }}
                    />
                  </LocalizationProvider>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      views={['month', 'year']}
                      value={experience.endDate ? parse(experience.endDate, 'yyyy-MM', new Date()) : null}
                      onChange={(newValue) => {
                        handleChange(index, 'endDate', newValue ? format(newValue, 'yyyy-MM') : '');
                      }}
                      format="MM/yyyy"
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: "small",
                          sx: {
                            '& .MuiOutlinedInput-root': {
                              '& fieldset': {
                                borderColor: 'rgb(209 213 219)',
                              },
                              '&:hover fieldset': {
                                borderColor: 'rgb(156 163 175)',
                              },
                            },
                          }
                        }
                      }}
                    />
                  </LocalizationProvider>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Description
              </label>
              <textarea
                value={experience.description}
                onChange={(e) => handleChange(index, 'description', e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 rounded-md h-32 resize-none"
                placeholder="Describe your project experience..."
              />
            </div>
          </div>
        ))}

        <button
          onClick={addExperience}
          className="text-emerald-500 hover:text-emerald-700 mb-6"
        >
          + Add Another Experience
        </button>

        <div className="flex justify-end gap-4">
          <button
            onClick={() => router.push('/skills')}
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