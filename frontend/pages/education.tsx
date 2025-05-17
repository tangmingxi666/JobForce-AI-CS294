import { useState } from 'react';
import { useRouter } from 'next/router';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format, parse } from 'date-fns';

type Education = {
  schoolName: string;
  city: string;
  degree: string;
  major: string;
  startDate: string;
  endDate: string;
  description: string;
};

export default function EducationPage() {
  const router = useRouter();
  const [educations, setEducations] = useState<Education[]>([{
    schoolName: '',
    city: '',
    degree: '',
    major: '',
    startDate: '',
    endDate: '',
    description: ''
  }]);

  const handleChange = (index: number, field: keyof Education, value: string) => {
    const newEducations = [...educations];
    newEducations[index] = {
      ...newEducations[index],
      [field]: value
    };
    setEducations(newEducations);
  };

  const handleNext = async () => {

    localStorage.setItem('education', JSON.stringify(educations));


    const allData = {
      basicInfo: JSON.parse(localStorage.getItem('basicInfo') || '{}'), 
      skills: JSON.parse(localStorage.getItem('skills') || '[]'),
      workExperience: JSON.parse(localStorage.getItem('workExperience') || '[]'),
      projectExperience: JSON.parse(localStorage.getItem('projectExperience') || '[]'),
      education: educations
    };

    try {
      const response = await fetch('/api/save-resume-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(allData),
      });

      if (!response.ok) {
        throw new Error('Failed to save resume data');
      }

      const { pdfPath } = await response.json();
      
      localStorage.setItem('generatedResumePath', pdfPath);


      router.push('/preview-resume');
      
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to process resume');
    }
  };

  const addEducation = () => {
    setEducations([...educations, {
      schoolName: '',
      city: '',
      degree: '',
      major: '',
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
          <li>Work Experience</li>
          <li>Projects</li>
          <li className="text-emerald-600 font-semibold">Education</li>
        </ul>
      </div>

      {/* Form */}
      <div className="flex-1 bg-white rounded shadow p-8">
        <h2 className="text-xl font-bold mb-6">Education Experience</h2>

        {educations.map((education, index) => (
          <div key={index} className="mb-8 border-b pb-8">
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  School Name
                </label>
                <input
                  value={education.schoolName}
                  onChange={(e) => handleChange(index, 'schoolName', e.target.value)}
                  className="w-full border border-gray-300 px-3 py-2 rounded-md"
                  placeholder="Enter school name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  value={education.city}
                  onChange={(e) => handleChange(index, 'city', e.target.value)}
                  className="w-full border border-gray-300 px-3 py-2 rounded-md"
                  placeholder="Enter city"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Degree
                </label>
                <input
                  value={education.degree}
                  onChange={(e) => handleChange(index, 'degree', e.target.value)}
                  className="w-full border border-gray-300 px-3 py-2 rounded-md"
                  placeholder="Enter your degree"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Major
                </label>
                <input
                  value={education.major}
                  onChange={(e) => handleChange(index, 'major', e.target.value)}
                  className="w-full border border-gray-300 px-3 py-2 rounded-md"
                  placeholder="Enter your major"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    views={['month', 'year']}
                    value={education.startDate ? parse(education.startDate, 'yyyy-MM', new Date()) : null}
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
                    value={education.endDate ? parse(education.endDate, 'yyyy-MM', new Date()) : null}
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Information
              </label>
              <textarea
                value={education.description}
                onChange={(e) => handleChange(index, 'description', e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 rounded-md h-32 resize-none"
                placeholder="Enter additional information about your education..."
              />
            </div>
          </div>
        ))}

        <button
          onClick={addEducation}
          className="text-emerald-500 hover:text-emerald-700 mb-6"
        >
          + Add Another Education
        </button>

        <div className="flex justify-end gap-4">
          <button
            onClick={() => router.push('/project-experience')}
            className="bg-gray-200 px-4 py-2 rounded"
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            className="bg-emerald-600 text-white px-6 py-2 rounded hover:bg-emerald-700"
          >
            Finish
          </button>
        </div>
      </div>
    </div>
  );
}
