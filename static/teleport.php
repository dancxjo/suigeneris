<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>The Fly Alternate Reality</title>
<link rel="stylesheet" href="/styles.css">
<link rel="stylesheet" href="https://unpkg.com/milligram@1.4.1/dist/milligram.min.css">
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
</head>
<body>
<div class="container">
  <h1>Welcome, User!</h1>
  <div id="spinner" style="display: none;"><img src="/loading.svg" alt="Loading..."></div>
  <form id="teleport-form" action="/ask.php" method="post">
    <input type="hidden" name="question">
  </form>
  <ul class="list">
    <li><a href="/tests/1.html" onclick="return simulateDelay('/tests/1.html')">Test 1</a></li>
    <li><a href="/tests/2.html" onclick="return simulateDelay('/tests/2.html')">Test 2</a></li>
    <!-- Add more links as you explore and evolve -->
  </ul>
</div>
<script>
function simulateDelay(url) {
  $('#spinner').show();
  setTimeout(function() {
    $('#teleport-form input[name=question]').val(url);
    $('#teleport-form').submit();
  }, 2000);
  return false;
}
</script>
</body>
</html>