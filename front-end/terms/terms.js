window.onload = function () {
    const modal = document.getElementById("termsModal");
    const button = document.getElementById("acceptTerms");

    // Only show modal if the user hasn't accepted
    const accepted = localStorage.getItem("termsAccepted");
    if (accepted !== "true") {
        modal.style.display = "flex";
    } else {
        modal.style.display = "none";
    }

    // Handle "Akkoord" button
    button.onclick = function () {
        localStorage.setItem("termsAccepted", "true");
        modal.style.display = "none";
    };
};