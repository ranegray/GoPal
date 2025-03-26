export function passwordErrorText(){
    const registerForm = document.getElementById('register_form');
    const passwordField = document.getElementById('password');
    const errorMessage = document.getElementById('password-error');
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[#?!@$%^&*\-]).{8,}$/;

    registerForm.addEventListener('submit', function(event) {
        const password = passwordField.value;
        const isPasswordValid = passwordRegex.test(password);
        errorMessage.classList.toggle('hidden', isPasswordValid);
        if (!isPasswordValid) {
            event.preventDefault();
        }
    });
}