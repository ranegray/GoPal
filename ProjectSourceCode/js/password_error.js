document.getElementById('register_form').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('password-error');
    
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[#?!@$%^&*\-]).{8,}$/;
    
    if (!passwordRegex.test(password)) {
        errorMessage.classList.remove('hidden');
    } else {
        errorMessage.classList.add('hidden');
        document.getElementById('register_form').submit();
    }
});