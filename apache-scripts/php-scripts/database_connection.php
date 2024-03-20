<?php
// получение данных о базе данных из конфигурационного файла
$config_file = 'apacheServer.config.json';
$config_data = json_decode(file_get_contents($config_file), true);

// подключение к базе данных
$conn = new mysqli(
    $config_data['database']['servername'],
    $config_data['database']['username'], 
    $config_data['database']['password'], 
    $config_data['database']['dbname']);

// проверка соединения
if ($conn->connect_error) {
    throw new Exception("Соединение не удалось: " . $conn->connect_error);
}
?>
