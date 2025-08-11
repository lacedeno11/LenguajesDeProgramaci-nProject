<?php
// register.php
$servername = "localhost:3306";
$username = "root"; // DB username
$password = "Lookatm-e5";     // DB password
$dbname = "user_auth";

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email    = trim($_POST['email'] ?? '');
    $username = trim($_POST['username'] ?? '');
    $pass     = trim($_POST['password'] ?? '');

    if (empty($email) || empty($username) || empty($pass)) {
        die("All fields are required.");
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        die("Invalid email format.");
    }

    $hash = password_hash($pass, PASSWORD_BCRYPT);

    $stmt = $conn->prepare("INSERT INTO users (email, username, password_hash) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $email, $username, $hash);

    if ($stmt->execute()) {
        header("Location: login.html?registered=1");
        exit();
    } else {
        if ($conn->errno === 1062) {
            echo "Email already registered.";
        } else {
            echo "Error: " . $stmt->error;
        }
    }

    $stmt->close();
}
$conn->close();
?>
