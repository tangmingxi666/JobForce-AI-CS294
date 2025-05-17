import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const filePath = path.join(process.cwd(), '..', 'Agent1', 'job_description', 'jobs.json');
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'Jobs config not found' });
  }
  const data = fs.readFileSync(filePath, 'utf-8');
  res.status(200).json(JSON.parse(data));
}