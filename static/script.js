<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/milligram/1.4.10/min.css">
	<link rel="stylesheet" href="/styles.css">
</head>
<body>
	<div class="container mt-5">
		<h1>Submission Form</h1>
		<form id="myForm" action="/submit" method="post">
			<label for="name">Name:</label>
			<input type="text" id="name" name="name" required>
			<br><br>
			<label for="message">Message:</label>
			<textarea id="message" name="message" required></textarea>
			<br><br>
			<button type="submit" class="btn btn-primary">Submit</button>
		</form>
	</div>
<script src="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@5.15.3/js/all.min.js"></script>
	<!-- SVG icon for submit button -->
	<svg id="submit-icon" width="24" height="24" viewBox="0 0 16 16">
		<rect x="2" y="2" width="12" height="12" fill="#ccc" rx="3"/>
		<path d="M13 8l-5-5 1.41-1.42L6 7.83a2 2 0 01-1.66-1.65l-1.99-.49L2 9l4 4 1 .5 1.41 1.42z" fill="#333"/>
	</svg>
<script>
	// Client-side scripting for interactivity
	const submitButton = document.getElementById("myForm").elements[3];
	submitButton.addEventListener("click", () => {
		// Add form submission logic here
	});
</script>
</body>
</html>