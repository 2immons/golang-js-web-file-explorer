<?php
// проверка, что пришел POST запрос
if ($_SERVER["REQUEST_METHOD"] == "POST") {

    // подключение к базе данных
    $servername = "localhost";
    $username = "username";
    $password = "password";
    $dbname = "statDB";

    $conn = new mysqli($servername, $username, $password, $dbname);

    // проверка соединения
    if ($conn->connect_error) {
        die("Соединение не удалось: " . $conn->connect_error);
    }
    // получение данных из тела запроса
    $data = json_decode(file_get_contents('php://input'), true);

    // подготовка SQL запроса для вставки в таблицу
    $sql = "INSERT INTO stat (total_size, date_time, root_path, load_time_seconds) VALUES (?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("isss", $data['TotalSize'], $data['RequestDate'], $data['RootPath'], $data['LoadTime']);
    
    // выполнение SQL запроса
    $stmt->execute();
    $stmt->close();
    
    // закрытие соединения с базой данных
    $conn->close();
} else {
    // если запрос не POST, отправка сообщения об ошибке
    http_response_code(405);
    echo "Некорректный запрос (неверный тип, ожидался POST)";
}
?>
