<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Teleportation Puzzle</title>
<link rel="stylesheet" href="https://unpkg.com/milligram@1.4.1/dist/milligram.min.css">
<link rel="stylesheet" href="/styles.css">
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<style>.loader { display: none; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); }</style>
</head>
<body>
<h1>Teleportation Puzzle</h1>
<div class="loader" id="loader">
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
viewBox="0 0 50 50" style="enable-background:new 0 0 50 50;" xml:space="preserve">
<path d="M43.78,26.69c-1.88,0-3.62-0.59-4.79-1.71l-15.6,-15.6C18.29,6.48,14.25,5,9.98,5c-7.25,0-13.5,5.84-13.5,13.48  C0,20.24,6.8,26.4,15.19,26.4l15.6,15.6c1.17,1.17,2.86,1.9,4.79,1.9s3.62-0.73,4.79-1.9L43.78,30.4C47.5,34.3,43.78,38.11,43.78,42  C43.78,43.52,43.5,45,43.23,46l-10.09,9.9L37.53,51l1.41-1.41c1.27-1.27,1.81-3.25,1.17-5.09z M10.19,3.5H9.68L0,28.59  l10.19,24.91C22.03,55.11,27.77,57,34.06,57c6.3,0,11.97-2.89,15.8-7.85l.49-.24V28.59L10.19,3.5z"></path>
</svg>
</div>
<form id="puzzle-form" action="/ask.php" method="post">
<input type="hidden" name="question" value="Solve the teleportation puzzle:">
<button type="submit">Submit</button>
</form>
<script>$('#puzzle-form').on('submit', function(e) { e.preventDefault(); $('#loader').show(); setTimeout(function() { $('#puzzle-form')[0].submit(); }, 2000); });</script>
</body>
</html>