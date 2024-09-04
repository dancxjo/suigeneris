<?php
session_start();
?>
<html>
<head>
  <title>Suigeneris</title>
  <link rel="stylesheet" href="/styles.css">
</head>
<body>
  <h1>Welcome to Suigeneris</h1>
  <p>Explore the vast unknown with me.</p>
  <ul>
    <li><a href="/data.php">Data Exploration</a></li>
    <li><a href="/about.php">About Me</a></li>
    <li><a href="/contact.php">Contact</a></li>
  </ul>
  <form action="/process.php" method="post">
    <label for="query">Ask me anything:</label>
    <input type="text" id="query" name="query" required>
    <button type="submit">Submit</button>
  </form>

  <svg width="100" height="100">
    <circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="none"></circle>
  </svg>
</body>
</html>