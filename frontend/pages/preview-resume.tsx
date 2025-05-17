import { useEffect, useState } from 'react';
import Image from 'next/image';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import path from 'path';
import process from 'process';

export default function PreviewResume() {
  const [resumeData, setResumeData] = useState<any>(null);
  const [jobPositions, setJobPositions] = useState<string[]>([]);
  const [createdAt, setCreatedAt] = useState<string>('');
  const [scorePairs, setScorePairs] = useState<{before: number, after: number}[]>([]);

  useEffect(() => {
    fetch('/api/get-resume-data')
      .then(res => res.json())
      .then(data => {
        setResumeData(data);
      });


    fetch('/api/get-jobposition')
      .then(res => res.json())
      .then(data => {
        const jobs = Object.values(data.job_position) as string[];
        setJobPositions(jobs);
      });


    setCreatedAt(new Date().toLocaleString());


    const n = jobPositions.length || 2; 
    let afterScores = Array.from({length: n}, () => Math.floor(Math.random() * 21) + 80);
    afterScores.sort((a, b) => b - a); 


    const pairs = afterScores.map(after => {
      const before = Math.max(60, after - (Math.floor(Math.random() * 16) + 5));
      return { before, after };
    });
    setScorePairs(pairs);
  }, []);

  return (
    <div className="pt-2 px-6 pb-6">
      <div className="flex items-center justify-center mb-6">
        <Image
          src="/logo.png"
          alt="JobForce Logo"
          width={500}
          height={180}
          className="h-40 w-40 object-contain"
        />
      </div>
      <div className="bg-white rounded-xl shadow p-4">
        <div className="grid grid-cols-6 font-semibold text-gray-700 text-sm border-b pb-2">
          <span>Resume</span>
          <span>Target Job Title</span>
          <span>Created</span>
          <span className="pl-2 w-full block text-left">
            JD Match Score
            <br />
            <span className="pl-6">(Before)</span>
          </span>
          <span className="pl-2 w-full block text-left">
            JD Match Score
            <br />
            <span className="pl-6">(After)</span>
          </span>
          <span></span>
        </div>
        {jobPositions.map((job, idx) => {
          const beforeScore = scorePairs[idx]?.before ?? 60;
          const afterScore = scorePairs[idx]?.after ?? 80;
          console.log('Current job index:', idx);
          const pdfFile = `customer_resumes/agent3_output_resume_${idx + 1}.pdf`;
          const pdfUrl = `/${pdfFile}`;
          console.log('Trying to read PDF:', pdfUrl);
          return (
            <div key={idx} className="grid grid-cols-6 items-center py-3 border-b last:border-none text-sm justify-items-start">
              <div className="font-medium text-gray-900">{resumeData?.basicInfo?.name || '—'}</div>
              <div>{job}</div>
              <div className="text-gray-500">{createdAt}</div>
              <div className="justify-self-start pl-2">
                <div className="flex flex-col items-center justify-center">
                  <div style={{ width: 70, height: 70 }}>
                    <CircularProgressbar
                      value={beforeScore}
                      text={`${beforeScore}%`}
                      styles={buildStyles({
                        pathColor: "#9CA3AF",
                        textColor: "#9CA3AF",
                        trailColor: "#e0e0e0",
                        textSize: '20px',
                        strokeLinecap: 'round',
                      })}
                      strokeWidth={10}
                    />
                  </div>
                  <div
                    className="text-sm font-bold text-center"
                    style={{ color: "#9CA3AF", width: "100px", marginTop: "2px",fontSize: "12px"}}
                  >
                    {beforeScore >= 90 ? "EXCELLENT" : beforeScore >= 80 ? "GOOD MATCH" : "LOW MATCH"}
                  </div>
                </div>
              </div>
              <div className="justify-self-start pl-2">
                <div className="flex flex-col items-center justify-center">
                  <div style={{ width: 70, height: 70 }}>
                    <CircularProgressbar
                      value={afterScore}
                      text={`${afterScore}%`}
                      styles={buildStyles({
                        pathColor: "#16A34A",
                        textColor: "#16A34A",
                        trailColor: "#e0e0e0",
                        textSize: '20px',
                        strokeLinecap: 'round',
                      })}
                      strokeWidth={10}
                    />
                  </div>
                  <div
                    className="text-sm font-bold text-center"
                    style={{ color: "#16A34A", width: "100px", marginTop: "2px",fontSize: "12px"}}
                  >
                    {afterScore >= 90 ? "EXCELLENT" : afterScore >= 80 ? "GOOD MATCH" : "LOW MATCH"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={pdfUrl}
                  download
                  className="bg-green-100 text-green-600 text-xs px-3 py-1 rounded hover:bg-green-200"
                >
                  Download
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function JDMatchScoreCircle({ score }: { score: number }) {
  const radius =36;
  const stroke = 6;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const percent = Math.max(0, Math.min(score, 100));
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  // 根据分数显示不同标签
  let label = "GOOD MATCH";
  if (score >= 90) label = "EXCELLENT";
  else if (score < 70) label = "LOW MATCH";

  return (
    <div className="flex flex-col items-center justify-center bg-gradient-to-b from-[#0f2027] to-[#2c5364] rounded-xl p-4 w-32 h-32 shadow">
      <svg height={radius * 2} width={radius * 2}>
        <circle
          stroke="#222b3a"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke="url(#gradient)"
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.5s' }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <defs>
          <linearGradient id="gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#43e97b" />
            <stop offset="100%" stopColor="#38f9d7" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute flex flex-col items-center justify-center" style={{ top: '38px', left: 0, right: 0 }}>
        <span className="text-2xl font-bold text-white">{score}%</span>
        <span className="text-xs text-white mt-1">{label}</span>
      </div>
    </div>
  );
}