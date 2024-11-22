// preloader.js
document.addEventListener("DOMContentLoaded", function () {
    const preloader = document.getElementById("preloader");
    const progress = document.querySelector(".progress");
    const progressText = document.getElementById("progress-text"); // Get the <p> element
    const content = document.getElementById("content");
  
    let progressValue = 0;
  
    // Simulate progress
    const interval = setInterval(() => {
      if (progressValue < 100) {
        progressValue += 5; // Increment progress by 5%
        progress.style.width = progressValue + "%"; // Update the width dynamically
        progressText.textContent = progressValue + "%"; // Update the percentage text
      } else {
        clearInterval(interval); // Stop the interval once progress is complete
        preloader.style.display = "none"; // Hide the preloader
        content.style.display = "block"; // Show the main content
        content.style.opacity = "1"; // Trigger fade-in effect
        document.body.style.overflow = "auto"; // Restore scrolling
      }
    }, 100); // Interval duration in milliseconds
  });
  