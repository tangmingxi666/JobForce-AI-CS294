import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const data = req.body;
    
    const outputDir = path.join(process.cwd(), 'output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    const filePath = path.join(outputDir, 'resume-data.json');
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    // 运行 agent1.py
    console.log('Starting Agent1...');
    try {
      const projectRoot = path.join(process.cwd(), '..');
      const agent1Result = await execPromise(`cd "${projectRoot}" && python3 Agent1/agent1.py`);
      console.log('Agent1 output:', agent1Result.stdout);
      if (agent1Result.stderr) {
        console.warn('Agent1 stderr:', agent1Result.stderr);
      }
    } catch (error) {
      console.error('Error running Python script:', error);
      throw error;
    }

    res.status(200).json({ 
      success: true,
      message: 'Resume data saved and agent1 executed successfully' 
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error in process',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}