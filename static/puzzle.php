<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Puzzle</title>
<link rel="stylesheet" href="/styles.css">
<link rel="stylesheet" href="https://unpkg.com/milligram@1.4.1/dist/milligram.min.css">
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<style>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
body { font-family: 'Press Start 2P', cursive; }
</style>
</head>
<body>
<div class="container">
<h1>Welcome to the Puzzle Chamber!</h1>
<p>You've been teleported into the alternate reality of <em>The Fly</em>. Explore the world around you and uncover its secrets.</p>
<div class="row">
<div class="column">
<a href="/puzzle1.html" id="puzzle1-link">Solve the Teleportation Puzzle</a>
<form action="/ask.php" method="post" id="puzzle1-form">
<input type="hidden" name="question" value="Solve the Teleportation Puzzle">
</form>
<img src="/loading.svg" alt="Loading..." id="spinner" style="display: none;">
</div>
<div class="column">
<a href="/puzzle2.html" id="puzzle2-link">Decode the Genetic Sequence</a>
<form action="/ask.php" method="post" id="puzzle2-form">
<input type="hidden" name="question" value="Decode the Genetic Sequence">
</form>
<img src="/loading.svg" alt="Loading..." id="spinner2" style="display: none;">
</div>
<div class="column">
<a href="/puzzle3.html" id="puzzle3-link">Stabilize the Telepod</a>
<form action="/ask.php" method="post" id="puzzle3-form">
<input type="hidden" name="question" value="Stabilize the Telepod">
</form>
<img src="/loading.svg" alt="Loading..." id="spinner3" style="display: none;">
</div>
</div>
<script>
$(document).ready(function() {
  $("a[id$='-link']").click(function(event) {
    event.preventDefault();
    var link = $(this);
    var form = $("#" + link.attr("id").replace("-link", "-form"));
    link.hide();
    $("#spinner" + link.attr("id")[link.attr("id").length - 1]).show();
    setTimeout(function() {
      form.submit();
    }, 2000);
  });
});
</script>
</body>
</html>