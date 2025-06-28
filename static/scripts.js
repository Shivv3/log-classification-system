document.addEventListener("DOMContentLoaded", function() {
    const fileInput = document.getElementById("file-upload");
    const fileLabel = document.querySelector(".custom-file-upload");
    if (fileInput && fileLabel) {
        fileInput.addEventListener("change", function() {
            if (fileInput.files.length > 0) {
                fileLabel.textContent = fileInput.files[0].name;
            } else {
                fileLabel.textContent = "Select CSV File";
            }
        });
    }
});
