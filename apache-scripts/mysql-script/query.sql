CREATE DATABASE IF NOT EXISTS statDB;

CREATE TABLE IF NOT EXISTS stat(
    id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
    total_size BIGINT NOT NULL,
    date_time TIMESTAMP NOT NULL,
    root_path VARCHAR(255) NOT NULL,
    load_time_seconds FLOAT NOT NULL
);

INSERT INTO stat (total_size, date_time, root_path, load_time_seconds) 
VALUES (1000, '2024-03-16 12:00:00', '/home/dir1/dir2/dir3', 10.5);

SELECT * FROM stat;
