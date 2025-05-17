import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const jobsData = req.body; 
    
    // 保存到 Agent1/job_description/jobs.json
    const jobDescDir = path.join(process.cwd(), '..', 'Agent1', 'job_description');
    if (!fs.existsSync(jobDescDir)) {
      fs.mkdirSync(jobDescDir, { recursive: true });
    }

    const filePath = path.join(jobDescDir, 'jobs.json');
    fs.writeFileSync(filePath, JSON.stringify(jobsData, null, 2));

    res.status(200).json({ message: 'Jobs config saved successfully' });
  } catch (error) {
    console.error('Error saving jobs config:', error);
    res.status(500).json({ message: 'Error saving jobs config' });
  }
}
