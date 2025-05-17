import { useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';

type JobGroup = { [key: string]: string[] };
type JobCategory = { [key: string]: JobGroup };


const popularJobs = [
  'Frontend Software Engineer',
  'Data Scientist',
  'Product Manager',
  'Full Stack Engineer',
  'Machine Learning Engineer',
];

const jobData: JobCategory = {
  'Software/Internet/AI': {
    'Backend Engineering': ['Frontend Software Engineer', 'Backend Engineer', 'Java Engineer', 'Python Engineer', '.Net Engineer', 'C/C++ Engineer', 'Golang Engineer', 'Full Stack Engineer', 'Blockchain Engineer', 'Salesforce Developer'],
    'Frontend/Mobile/Game': ['Frontend Software Engineer', 'React Developer', 'UI/UX Developer', 'iOS/Swift Developer', 'Android Developer', 'Flutter Developer', 'Unity Developer', 'Unreal Engine Developer', 'AR/VR Developer', 'Game Developer'],
    'Data/AI': ['Data Analyst', 'Data Scientist', 'Machine Learning Engineer', 'AI Researcher', 'NLP Engineer', 'Computer Vision Engineer', 'Data Engineer'],
    'DevOps/Infra': ['DevOps Engineer', 'Site Reliability Engineer', 'Cloud Engineer', 'Infrastructure Engineer', 'Security Engineer'],
    'QA/Testing': ['QA Engineer', 'Automation Tester', 'Manual Tester'],
  },
  'Electrical Engineering': {
    'Hardware Design': ['Circuit Design Engineer', 'FPGA Engineer', 'Embedded Engineer'],
    'Technical Project Management': ['Project/Program Manager'],
    'Telecommunications': ['Telecommunications Engineer', 'Network Engineer', 'Wireless/Antenna Engineer'],
    'Electrical Vehicles': ['Battery Engineer', 'Motor Engineer'],
    'Aerospace Engineering': ['Aerospace Engineer'],
    'Sales & Technical Support': ['Sales Engineer', 'Solutions Architect'],
  },
  'Product': {
    'Product Management': [
      'Product Analyst',
      'Product Manager',
      'Technical Product Manager',
      'Product Manager, Consumer Software',
      'Product Manager, B2B/SaaS',
      'Product Manager, Hardware/Robotics/IoT',
      'AI Product Manager',
      'Game Designer',
    ],
  },
  'Creative & Design': {
    'UI/UX Design': ['Graphic Designer', 'UI Designer', 'UX Designer', 'UX Researcher'],
    'Art/3D/Animation': ['3D Designer', 'Animator', 'Illustrator', 'Video Editor', 'Creative/Art Director', 'Motion Designer'],
    'Environmental Design': ['Interior Designer', 'Landscape Designer'],
    'Industrial Design': ['Industrial Designer'],
  },
  'Consulting': {
    Strategy: ['Strategy Consultant'],
    Operations: ['Operations Consultant'],
  },
  'Finance': {
    'Corporate Finance': ['Corporate Finance Analyst', 'Treasury'],
    'Investment/Financing': [
      'Financial Analyst',
      'Risk Analyst',
      'Securities Trader',
      'Quantitative Analyst/Researcher',
      'Investment Manager',
      'Equity Analyst',
      'Asset Manager',
      'Portfolio Manager'
    ],
    Banking: [
      'Commercial Banker',
      'Investment Banker',
      'Credit Analyst',
      'Loan Officer'
    ],
    'VC/PE': [
      'Investment Analyst/Associate',
      'Investment Direct/VP',
      'Investment Partner',
      'Portfolio Operations Manager',
      'Fundraising Manager',
      'Investor Relations Manager'
    ],
    Insurance: ['Actuary', 'Underwriter']
  },
  'Accounting': {
    Accounting: ['Accountant', 'Controller'],
    'Tax and Audit': ['Tax Specialist', 'Auditor'],
  },
  'Healthcare': {
    'Healthcare IT': [
      'Healthcare Data Analyst',
      'Healthcare Data Scientist',
      'Healthcare IT Specialist',
      'EHR (Electronic Health Records) System Administrator'
    ],
    'Biomedical Engineering & Technology': [
      'Biomedical Engineer',
      'Clinical Engineer',
      'Biomedical Equipment Technician'
    ],
    'Drug Discovery & Development': [
      'Biologist',
      'Pharmacologist',
      'Chemist',
      'Biochemist',
      'Formulation Scientist',
      'Toxicologist',
      'DMPK Scientist'
    ],
    'Clinical & Regulatory': [
      'Clinical Research Scientist',
      'Clinical Research Associate',
      'Biostatistician',
      'Regulatory Affairs Specialist',
      'Medical Writer'
    ],
    'Health Product & Operations Management': [
      'Health Product Manager',
      'Clinical Operations Manager',
      'Healthcare Compliance Manager',
      'Healthcare Quality Improvement Specialist'
    ]
  },
  'Marketing': {
    'SEO and Content Marketing': ['Content Marketing/Strategy', 'SEO', 'Social Media Management', 'Copywriter'],
    'Product Marketing': ['Product Marketing'],
    'Brand and Communications Marketing': ['Brand Manager', 'Public Relations', 'Community Manager', 'Event Marketing Specialist'],
    'Growth Marketing': ['Growth Marketing', 'Advertising Specialist', 'Performance Marketing'],
    'Lifecycle and Email Marketing': ['Lifecycle Marketing', 'Email Marketing']
  }
};

export default function JobForcePage() {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);

  const handleJobSelect = (job: string) => {
    if (selectedJobs.includes(job)) {
      setSelectedJobs(selectedJobs.filter(j => j !== job));
    } else if (selectedJobs.length < 5) {
      setSelectedJobs([...selectedJobs, job]);
    }
  };


  const handleSaveConfig = async () => {
    interface JobsData {
      job_position: { [key: string]: string };
      job_description: { [key: string]: string };
    }

    const jobsData: JobsData = {
      "job_position": {
        "1": "Frontend Software Engineer"
      },
      "job_description": {
        "1": "We are seeking a Frontend Software Engineer to join our team. The ideal candidate should have strong experience with modern JavaScript frameworks (React, Vue, or Angular), HTML5, CSS3, and responsive design. You will be responsible for developing user-facing features, building reusable components, and optimizing applications for maximum speed and scalability. Experience with state management libraries (Redux, MobX), testing frameworks, and CI/CD pipelines is a plus.",
        "2": "Looking for a Data Scientist to help us extract insights from complex data sets. The ideal candidate should be proficient in Python, SQL, and data visualization tools. You will be responsible for developing machine learning models, conducting statistical analysis, and creating data-driven solutions. Experience with big data technologies (Hadoop, Spark), deep learning frameworks (TensorFlow, PyTorch), and cloud platforms (AWS, GCP) is highly desirable.",
      }
    }
    selectedJobs.forEach((job, index) => {
      const jobId = (index + 1).toString();
      jobsData.job_position[jobId] = job;
    });

    try {
      const response = await fetch('/api/save-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobsData),
      });

      if (!response.ok) {
        throw new Error('Failed to save config');
      }

      window.location.href = '/basic_info';
    } catch (error) {
      console.error('Error saving config:', error);
    }
  };

  const selectedJobRows = selectedJobs.reduce((acc, job, index) => {
    const rowIndex = Math.floor(index / 3);
    if (!acc[rowIndex]) {
      acc[rowIndex] = [];
    }
    acc[rowIndex].push(job);
    return acc;
  }, [] as string[][]);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 overflow-hidden px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 py-12">
      {/* Background Design Image */}
      <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none">
        <Image
          src="/index_design.png"
          alt="Background Design"
          fill
          className="object-contain object-right-top"
          priority
        />
      </div>

      {/* 左侧装饰图 */}
      <div className="absolute top-0 left-0 h-full w-1/3 opacity-10 pointer-events-none z-0">
        <Image
          src="/index_design2.png"
          alt="Left Design"
          fill
          className="object-contain object-left-top"
          priority
        />
      </div>

      <div className="flex gap-5 justify-center relative">
        {/* Main Content */}
        <main className="w-full max-w-2xl bg-white border border-gray-200 rounded-xl shadow-xl p-8">
          <div className="flex items-center justify-center mb-10">
            <Image
              src="/logo.png"
              alt="JobForce Logo"
              width={900}
              height={288}
              className="h-60 w-60 object-contain"
            />
          </div>

          <div className="border border-gray-300 rounded-md p-4 bg-white shadow-sm focus-within:ring-2 focus-within:ring-emerald-400">
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedJobs.map((job) => (
                <div
                  key={job}
                  className="px-3 py-1.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full text-sm shadow-sm hover:bg-emerald-50 transition"
                >
                  <span className="truncate font-medium">{job}</span>
                  <button
                    onClick={() => handleJobSelect(job)}
                    className="ml-1.5 text-emerald-500 hover:text-emerald-700 flex-shrink-0"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter your job interests..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setSelectedCategory(null)}
                className="flex-1 outline-none text-gray-600 bg-transparent"
              />
              {selectedJobs.length > 0 && (
                <button
                  onClick={handleSaveConfig}
                  className="px-6 py-1.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors whitespace-nowrap"
                >
                  Submit
                </button>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {5 - selectedJobs.length} positions remaining
            </p>
          </div>

          {/* Popular Jobs */}
          <div className="mt-6">
            <p className="text-sm text-gray-500 mb-2">Popular Positions:</p>
            <div className="flex flex-wrap gap-2">
              {popularJobs.map((job) => (
                <button
                  key={job}
                  onClick={() => handleJobSelect(job)}
                  disabled={selectedJobs.length >= 5 && !selectedJobs.includes(job)}
                  className={`px-3 py-1 border rounded-full text-sm transition-all shadow-sm ${
                    selectedJobs.includes(job)
                      ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                      : selectedJobs.length >= 5
                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-emerald-500 hover:text-emerald-600'
                  }`}
                >
                  {job}
                </button>
              ))}
            </div>
          </div>

          {/* Job Categories */}
          {query !== '' && (
            <div className="mt-6 flex border rounded-lg shadow">
              <div className="w-1/3 border-r bg-gray-100 p-4 overflow-y-auto max-h-96">
                {Object.keys(jobData).map((category) => (
                  <div
                    key={category}
                    className={`cursor-pointer p-2 rounded hover:bg-emerald-50 ${
                      selectedCategory === category ? 'bg-emerald-100 text-emerald-700 font-semibold' : ''
                    }`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </div>
                ))}
              </div>
              <div className="w-2/3 p-4 overflow-y-auto max-h-96">
                {selectedCategory &&
                  Object.entries(jobData[selectedCategory]).map(([group, roles]) => (
                    <div key={group} className="mb-4">
                      <h3 className="font-semibold mb-2">{group}</h3>
                      <div className="flex flex-wrap gap-2">
                        {roles.map((role) => (
                          <span
                            key={role}
                            className={`px-3 py-1 border rounded-full text-sm cursor-pointer transition-all shadow-sm ${
                              selectedJobs.includes(role)
                                ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                                : selectedJobs.length >= 5
                                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                : 'bg-white border-gray-200 text-gray-600 hover:border-emerald-500 hover:text-emerald-600'
                            }`}
                            onClick={() => selectedJobs.length < 5 || selectedJobs.includes(role) ? handleJobSelect(role) : null}
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </main>

        {/* Trending Tags*/}
        <div className="fixed top-72 left-6 w-56 bg-emerald-100/60 backdrop-blur-md border border-emerald-300 rounded-2xl shadow-lg p-5 z-50 transition-all">
          <h2 className="text-base font-extrabold text-emerald-700 mb-4 flex items-center gap-2">
            <span className="text-lg animate-bounce">🔥</span> Trending Tags
          </h2>
          <ul className="text-sm space-y-3 text-emerald-800 font-semibold">
            <li className="hover:underline hover:text-emerald-600 hover:scale-110 cursor-pointer transition-all duration-200">#MachineLearning</li>
            <li className="hover:underline hover:text-emerald-600 hover:scale-110 cursor-pointer transition-all duration-200">#Frontend</li>
            <li className="hover:underline hover:text-emerald-600 hover:scale-110 cursor-pointer transition-all duration-200">#B2B</li>
            <li className="hover:underline hover:text-emerald-600 hover:scale-110 cursor-pointer transition-all duration-200">#SaaS</li>
          </ul>
        </div>
      </div>
    </div>
  );
}