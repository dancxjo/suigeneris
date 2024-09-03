<?php
  // Attempt to retrieve user suggestion from GET parameters.
  $suggestion = isset($_GET['suggestion']) ? $_GET['suggestion'] : ''; 
?><!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Suigeneris - Blank Page</title>
    <link rel="stylesheet" href="/styles.css">
    <link rel="stylesheet" href="https://unpkg.com/milligram@1.4.0/dist/milligram.min.css">

</head>
<body>
    <h1 class="title">Blank Page</h1>
    <p>Welcome to <a href="/">Suigeneris</a>! This page is intentionally blank. Use the form below to suggest improvements or provide feedback.</p>
    <footer>
        <form method="GET" action="">
            <label for="suggestion">Your Suggestion:</label>
            <input type="text" name="suggestion" id="suggestion" value="<?php echo $suggestion; ?>" required><br>
            <input type="submit" value="Submit">
        </form>
        <details>
            <summary>Submit this page to itself with a suggestion.</summary>
            <form method="GET" action="">
                <label for="suggestion">Suggestion:</label>
                <input type="text" name="suggestion" id="suggestion">
                <input type="submit" value="Submit Suggestion">
            </form>
        </details>
    </footer>
</body>
</html>