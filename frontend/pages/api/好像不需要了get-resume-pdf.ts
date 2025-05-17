import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // 获取文件名参数
    const { file } = req.query;
    if (!file || Array.isArray(file)) {
      return res.status(400).json({ message: 'Missing or invalid file parameter' });
    }

    // 拼接 PDF 路径（只允许 agent3_output 目录下的文件）
    const pdfPath = path.join(process.cwd(), 'agent3_output', file as string);

    // 检查文件是否存在
    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({ message: 'PDF file not found' });
    }

    // 读取文件
    const fileBuffer = fs.readFileSync(pdfPath);

    // 设置响应头
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${file}"`);

    // 发送文件
    res.send(fileBuffer);
  } catch (error) {
    console.error('Error serving PDF:', error);
    res.status(500).json({ message: 'Error serving PDF file' });
  }
}