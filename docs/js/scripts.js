/* --- Projects: scroll reveal (progressive enhancement) --------------------
   Only runs if the <head> gate added .pj-anim, i.e. IntersectionObserver
   exists and the visitor has not asked for reduced motion. Any failure path
   strips the class, which restores full visibility. -------------------------- */
(function () {
  var root = document.documentElement;
  if (!root.classList.contains("pj-anim")) return;

  try {
    var rows = document.querySelectorAll(".pj-row[data-pj-reveal]");
    if (!rows.length) {
      root.classList.remove("pj-anim");
      return;
    }

    // Tracks whether the observer is ALIVE, not whether anything was revealed.
    // An observer delivers a first callback for every target right after
    // observe(), even when nothing intersects — so this flips to true on a
    // normal load at the top of the page, where no project row is in view yet.
    // (Keying the failsafe off "something was revealed" would strip .pj-anim
    // after 3s and kill the animation before the visitor ever scrolled down.)
    var delivered = false;
    var io = new IntersectionObserver(
      function (entries, obs) {
        delivered = true;
        for (var i = 0; i < entries.length; i++) {
          if (!entries[i].isIntersecting) continue;
          entries[i].target.classList.add("is-in");
          obs.unobserve(entries[i].target);
        }
      },
      // threshold 0 + negative bottom margin: a fractional threshold can never
      // be satisfied by a row taller than viewport / threshold.
      { threshold: 0, rootMargin: "0px 0px -12% 0px" }
    );

    for (var j = 0; j < rows.length; j++) io.observe(rows[j]);

    // Failsafe: if the observer never delivered anything at all, it is not
    // working — un-hide everything rather than leaving the section blank.
    window.setTimeout(function () {
      if (!delivered) root.classList.remove("pj-anim");
    }, 3000);
  } catch (e) {
    root.classList.remove("pj-anim");
  }
})();

const form = document.getElementById("form");
const progress = document.getElementById("progress");
const progressBar = progress ? progress.querySelector(".p-bar-inner") : null;

// Enable Bootstrap tooltips
if (window.bootstrap) {
  const tooltipTriggerList = document.querySelectorAll(
    '[data-bs-toggle="tooltip"]'
  );
  [...tooltipTriggerList].map(
    (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
  );
}

if (form && progress && progressBar) {
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
}
