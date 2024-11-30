const form = document.getElementById("form");
const result = document.getElementById("result");
const progress = document.getElementById("progress");
const progressBar = progress.querySelector(".p-bar-inner");

// Enable Bootstrap tooltips
const tooltipTriggerList = document.querySelectorAll(
  '[data-bs-toggle="tooltip"]'
);
const tooltipList = [...tooltipTriggerList].map(
  (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
);

form.addEventListener("submit", function (e) {
  e.preventDefault();
  const formData = new FormData(form);
  const object = Object.fromEntries(formData);
  const json = JSON.stringify(object);

  // Show the progress bar and start filling it up
  progress.style.display = "block";
  let width = 0;
  progressBar.style.width = "0%"; // Initialize the progress bar

  const progressInterval = setInterval(() => {
    if (width >= 110) {
      clearInterval(progressInterval);

      // Trigger form submission after progress bar is full
      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: json,
      })
        .then(async (response) => {
          let json = await response.json();
          if (response.status == 200) {
            // Hide the progress bar after completion
            setTimeout(() => {
              progress.style.display = "none";
            }, 500);

            // Show the success modal after the progress bar is full
            const successModal = new bootstrap.Modal(
              document.getElementById("successModal")
            );
            successModal.show();
          } else {
            console.log(json.message);
          }
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          form.reset();
        });
    } else {
      width += 10; // Increment the progress
      console.log(width);
      progressBar.style.width = width + "%";
      progressBar.setAttribute("aria-valuenow", width);
    }
  }, 100); // Update progress every 100ms
});
