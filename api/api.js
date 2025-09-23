export default function handler(req, res) {
  // Устанавливаем CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'https://test-practica.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Разрешаем только POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  
  try {
    const { name, email, phone, message } = req.body;
    
    // Логируем данные
    const logEntry = {
      timestamp: new Date().toISOString(),
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      roistat: req.query.roistat || 'none',
      data: { name, email, phone, message }
    };
    
    console.log('📨 Webhook received:', logEntry);
    
    // Успешный ответ
    res.status(200).json({
      success: true,
      message: 'Заявка успешно принята',
      timestamp: logEntry.timestamp,
      received: logEntry.data
    });
    
  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      details: error.message 
    });
  }
}