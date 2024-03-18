CREATE DATABASE IF NOT EXISTS statDB;

CREATE TABLE stat (
    id INT AUTO_INCREMENT PRIMARY KEY,
    total_size BIGINT,
    date_time TIMESTAMP,
    root_path VARCHAR(255),
    load_time_seconds FLOAT
);

INSERT INTO stat (total_size, date_time, root_path, load_time_seconds) 
VALUES (1000, '2024-03-16 12:00:00', '/home/dir1/dir2/dir3', 10.5);

SELECT * FROM stat;
