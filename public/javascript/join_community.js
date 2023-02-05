const form = document.getElementById("registration-form");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const errorMessage = document.getElementById("error-message");
form.addEventListener("submit", (event) => {
    let isValid = true;
    let errorMessageString = "";

    // If the user is already a community member (the username already exists and the password is correct), then nothing happens.
    // TODO: check usernameExist in backend
    let usernameExist = false;
    if (usernameExist) {
        isValid = false;
        // If password correct, nothing happens
        // If password incorrect, the system informs the user to re-enter the username and/or password.
        usernameInput.classList.add("invalid");
        errorMessageString += "• Please re-enter the username and/or password.<br>";
    }
    // If username does not satisfy the system’s username selection requirements, the system asks the user to provide a different username.
    // TODO: check isBannedUser in backend
    let isBannedUser = false;
    if (isBannedUser) {
        isValid = false;
        usernameInput.classList.add("invalid");
        errorMessageString += "• Please provide a different username.<br>";
    }
    if (usernameInput.value.length < 3) {
        isValid = false;
        usernameInput.classList.add("invalid");
        errorMessageString += "• Username must be at least 3 characters long.<br>";
    }
    // if the password does not satisfy the system’s password strength requirements, the system asks the user to provide a different password.
    if (passwordInput.value.length < 4) {
        isValid = false;
        passwordInput.classList.add("invalid");
        errorMessageString += "• Password must be at least 4 characters long.<br>";
    }
    if (!isValid) {
        event.preventDefault();
        errorMessage.style.display = "block";
        errorMessage.innerHTML = errorMessageString + '<br>';
    }
});