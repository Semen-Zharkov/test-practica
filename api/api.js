import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  
  try {
    const logEntry = {
      timestamp: new Date().toISOString(),
      ip: req.headers['x-forwarded-for'] || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
      roistat: req.query.roistat || 'none',
      body: req.body
    };
    
    // 1. Логируем в консоль Vercel
    console.log('WEBHOOK_LOG:', JSON.stringify(logEntry));
    
    // 2. Пытаемся записать в файл (работает только в dev)
    await logToFile(logEntry);
    
    
    res.status(200).json({
      success: true,
      message: 'Заявка принята',
      timestamp: logEntry.timestamp,
      logId: Math.random().toString(36).substr(2, 9)
    });
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
}

// Логирование в файл (работает только в development)
async function logToFile(data) {
    const logDir = path.join(process.cwd(), 'logs');
    const logFile = path.join(logDir, 'webhooks.log');
    
    // Создаем директорию если не существует
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    const logLine = JSON.stringify(data, null, 2) + ',\n';
    fs.appendFileSync(logFile, logLine);
    console.log('📝 Log written to file:', logFile);
}