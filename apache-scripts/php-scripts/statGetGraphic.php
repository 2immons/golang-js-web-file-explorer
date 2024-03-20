<?php
// cors:
header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Methods: GET, OPTIONS");
header('Content-Type: application/json');
if ($_SERVER['REQUEST_METHOD'] == "OPTIONS") {
    header("Access-Control-Allow-Headers: Content-Type");
    header("HTTP/1.1 200 OK");
die();
}

try {
    // проверка, что пришел GET запрос
    if ($_SERVER["REQUEST_METHOD"] == "GET") {
        // файл с подключением к базе данных
        require_once 'database_connection.php';

        // SQL запрос для выборки данных
        $sql = "SELECT id, total_size, date_time, root_path, load_time_seconds FROM stat";
        $query_result = $conn->query($sql);

        header("Content-Type:  application/json");

        // формиование массива данных для отправки на клиент
        if ($query_result->num_rows > 0) {
            $data = array();
            while($row = $query_result->fetch_assoc()) {
                $data[] = $row;
            }

            // закрытие соединения с базой данных
            $conn->close();

            http_response_code(200);
            echo json_encode($data);
        } else {
            http_response_code(400);
            echo json_encode(array('message' => "Нет данных в таблице"));
        }
    } else {
        // если запрос не GET, отправка сообщения об ошибке
        http_response_code(405);
        header("Content-Type:  application/json");
        echo json_encode(array('message' => "Ошибка запроса PHP"));
    }
} catch (Exception $e) {
    http_response_code(500);
    header("Content-Type:  application/json");
    echo json_encode(array('message' => $e->getMessage()));
}
?>
