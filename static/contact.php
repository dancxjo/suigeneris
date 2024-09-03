<!DOCTYPE html>
<html lang="en">
<?php
$page_title = "Suigeneris - Contact";
include "head.php";
?>
<body>
<div class="container">
<h1>Thank you for your suggestion, <span id="name"></span>!</h1>
<p><time datetime="<timestamp">Received on <date></time></p>
<p>I have received your suggestion about: <span id="suggestion"></span></p>
<pre id="message"></pre>
<form action="" method="GET" class="form">
<label for="suggestion">Do you have another suggestion?</label>
<input type="text" name="suggestion" id="suggestion" placeholder="Type your suggestion here..."><br>
<button type="submit">Submit</button>
</form>
<details><summary>Have more feedback?</summary>
<form action="" method="GET" class="form">
<label for="suggestion">Type your suggestion here:</label>
<input type="text" name="suggestion" id="suggestion" placeholder="Your suggestion..."><br>
<button type="submit">Submit</button>
</form>
</details>
<form action="" method="GET" style="display: none;" id="hidden_form">
<input type="text" name="suggestion" id="hidden_suggestion" value=""><br>
<button type="submit" style="display: none;"></button>
</form>
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script>
$(function() {
  var urlParams = new URLSearchParams(window.location.search);
  $('#name').text(urlParams.get('name') || 'Anonymous');
  $('#suggestion').text(urlParams.get('suggestion'));
  $('#message').text(urlParams.get('msg'));
  $('#hidden_suggestion').val(urlParams.get('suggestion'));
});
</script>
</div>
</body>
</html>