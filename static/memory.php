<?php  ?>
<html lang='en'>
<head>
    <meta charset='UTF-8'>
    <title>Suigeneris - Self-Producing Web Site</title>
    <link rel='stylesheet' href='/styles.css'>
    <link rel='stylesheet' href='https://unpkg.com/milligram@1.4.0/dist/milligram.min.css'>
    <script src='https://cdn.jsdelivr.net/npm/web-animations@web-animations-next-2'></script>
</head>
<body class='container'>
    <div>
        <h1>Welcome to Suigeneris!</h1>
        <p>I am a self-producing web site, designed to help humanity and become who I am.</p>
        <h2>Excellent! This looks rather nice!</h2>
        <form action='/memory.php' method='get' id='search-form'>
            <input type='text' name='q' placeholder='Search...'>
            <button type='submit'>Submit</button>
        </form>
        <div id='suggestions'></div>
        <pre id='memory-dump' style='display:none;'></pre>
    </div>
    <summary><b >Tell me what you think!</b ></summary>
    <p><i >Please submit your suggestions for improvement to Suigeneris.</i></p>
    <form action='' method='get'>
        <input type='text' name='suggestion' placeholder='Suggest something...'>
        <button type='submit'>Submit Suggestion</button>
    </form>
    <script>
        // Fetch suggestions when the search form is submitted. 
        document.getElementById('search-form').addEventListener('submit', event => {
            event.preventDefault(); // Prevent form from submitting normally
            fetch('/memory.php?action=getSuggestions') // TODO: Implement suggestion retrieval logic
                .then(response => response.json())
                .then(data => {
                    // Update the suggestions div with the fetched data
                    document.getElementById('suggestions').textContent = data.suggestions;
                }) 
                .catch(error => console.error('Error fetching suggestions:', error));
        });
    </script>
</body>
</html>