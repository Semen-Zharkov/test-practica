php
<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

// Обрабатываем CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
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
    // Получаем raw JSON данные
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    // Если не JSON, пробуем получить form-data
    if (json_last_error() !== JSON_ERROR_NONE) {
        $data = $_POST;
    }
    
    // Подготавливаем данные для логирования
    $logEntry = [
        'timestamp' => date('Y-m-d H:i:s'),
        'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
        'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown',
        'method' => $_SERVER['REQUEST_METHOD'],
        'headers' => getallheaders(),
        'body' => $data ?: $input,
        'get_params' => $_GET
    ];
    
    // Записываем в лог-файл
    $logResult = writeToLog($logEntry);
    
    
    // Успешный ответ
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Заявка успешно принята',
        'timestamp' => $logEntry['timestamp'],
        'log_id' => uniqid()
    ]);
    
} catch (Exception $e) {
    // Ошибка сервера
    http_response_code(500);
    echo json_encode([
        'error' => 'Internal server error',
        'details' => $e->getMessage()
    ]);
}

/**
 * Запись данных в лог-файл
 */
function writeToLog($data) {
    $logDir = __DIR__ . '/logs';
    
    // Создаем директорию если не существует
    if (!is_dir($logDir)) {
        mkdir($logDir, 0755, true);
    }
    
    $logFile = $logDir . '/webhooks.log';
    $logEntry = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) . ",\n";
    
    // Записываем в файл
    return file_put_contents($logFile, $logEntry, FILE_APPEND | LOCK_EX);
}

?>