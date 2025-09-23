<?php
// Явно устанавливаем CORS заголовки ПЕРЕД любым выводом
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');
header('Content-Type: application/json; charset=utf-8');

// Обрабатываем preflight OPTIONS запрос
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Разрешаем только POST запросы
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

try {
    // Получаем JSON данные
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid JSON data');
    }
    
    // Создаем директорию для логов
    $logDir = __DIR__ . '/logs';
    if (!is_dir($logDir)) {
        mkdir($logDir, 0755, true);
    }
    
    // Подготавливаем запись лога
    $logEntry = [
        'timestamp' => date('Y-m-d H:i:s'),
        'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
        'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown',
        'roistat' => $_GET['roistat'] ?? 'none',
        'data' => $data
    ];
    
    // Записываем в лог
    $logLine = json_encode($logEntry, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) . ",\n";
    file_put_contents($logDir . '/webhooks.log', $logLine, FILE_APPEND | LOCK_EX);
    
    // Успешный ответ
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Заявка успешно принята',
        'timestamp' => $logEntry['timestamp'],
        'received_data' => $data,
        'roistat_param' => $_GET['roistat'] ?? 'not provided'
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'error' => 'Bad request',
        'details' => $e->getMessage()
    ]);
}
?>