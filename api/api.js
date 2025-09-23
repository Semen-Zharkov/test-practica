export default async function handler(req, res) {
  // Простые CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Обрабатываем OPTIONS запрос
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Разрешаем только POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    console.log('📨 Received webhook data:', req.body);

    // Простой ответ для тестирования
    const response = {
      success: true,
      message: 'Данные успешно получены',
      timestamp: new Date().toISOString(),
      received_data: req.body,
      roistat_visit: req.body?.roistat_visit || 'not_provided'
    };

    console.log('✅ Response:', response);
    
    res.status(200).json(response);

  } catch (error) {
    console.error('❌ API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      details: error.message
    });
  }
}