<?php
// установка заголовков
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// проверка, что пришел GET запрос
if ($_SERVER["REQUEST_METHOD"] == "GET") {
    // подключение к базе данных
    $servername = "localhost";
    $username = "root";
    $password = "Orig195025";
    $dbname = "statDB";

    $conn = new mysqli($servername, $username, $password, $dbname);

    // проверка соединения
    if ($conn->connect_error) {
        die("Соединение не удалось: " . $conn->connect_error);
    }

    // SQL запрос для выборки данных
    $sql = "SELECT * FROM stat";
    $query_result = $conn->query($sql);

    // формирование HTML таблицы на основе данных из базы данных
    $table = "<table border='2'>
        <tr>
            <th>№</th>
            <th>Размер</th>
            <th>Дата,время</th>
            <th>Путь</th>
            <th>Время</th>
        </tr>";
    if ($query_result->num_rows > 0) {
        while($row = $query_result->fetch_assoc()) {
            $table .= "<tr>
                <td>".$row["id"]."</td>
                <td>".$row["total_size"]."</td>
                <td>".$row["date_time"]."</td>
                <td>".$row["root_path"]."</td>
                <td>".$row["load_time_seconds"]."</td>
            </tr>";
        }
    } else {
        $table .= "<tr><td colspan='5'>Нет данных о запросах</td></tr>";
    }
    $table .= "</table>";

    // закрытие соединения с базой данных
    $conn->close();

    // установка заголовка HTTP для указания типа содержимого как HTML
    header("Content-Type: text/html");

    // вывод таблицы HTML
    http_response_code(200);
    header("Access-Control-Allow-Origin: *");
    echo $table;
} else {
    // если запрос не GET, отправка сообщения об ошибке
    http_response_code(405);
    header("Content-Type:  application/json");
    echo json_encode(array('message' => "Ошибка запроса PHP"));
}
?>
