<?php
// Простой webhook для логов
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

if ($_POST) {
    $data = $_POST;
} else {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true) ?: ['raw_data' => $input];
}

$logEntry = [
    'time' => date('Y-m-d H:i:s'),
    'ip' => $_SERVER['REMOTE_ADDR'],
    'data' => $data
];

$logLine = json_encode($logEntry, JSON_UNESCAPED_UNICODE) . ",\n";
file_put_contents('webhooks.log', $logLine, FILE_APPEND);

echo json_encode(['status' => 'success', 'time' => $logEntry['time']]);
?>