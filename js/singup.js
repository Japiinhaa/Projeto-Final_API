window.addEventListener('DOMContentLoaded', function() {
	var passwordInputs = document.querySelectorAll("input[type='password'][data-eye]");

	passwordInputs.forEach(function(input, i) {
		var id = 'eye-password-' + i;
		var el = document.getElementById(id);

		var wrapper = document.createElement('div');
		wrapper.style.position = 'relative';
		wrapper.id = id;

		input.style.paddingRight = '60px';
		input.parentNode.insertBefore(wrapper, input);
		wrapper.appendChild(input);

		var toggleButton = document.createElement('div');
		toggleButton.innerHTML = 'Show';
		toggleButton.className = 'btn btn-primary btn-sm';
		toggleButton.id = 'passeye-toggle-' + i;
		toggleButton.style.position = 'absolute';
		toggleButton.style.right = '10px';
		toggleButton.style.top = (input.offsetHeight / 2) - 12 + 'px';
		toggleButton.style.padding = '2px 7px';
		toggleButton.style.fontSize = '12px';
		toggleButton.style.cursor = 'pointer';
		wrapper.appendChild(toggleButton);

		var hiddenInput = document.createElement('input');
		hiddenInput.type = 'hidden';
		hiddenInput.id = 'passeye-' + i;
		wrapper.appendChild(hiddenInput);

		var invalidFeedback = input.parentNode.parentNode.querySelector('.invalid-feedback');
		if (invalidFeedback) {
			wrapper.appendChild(invalidFeedback.cloneNode(true));
		}

		input.addEventListener("keyup", function() {
			document.getElementById('passeye-' + i).value = this.value;
		});

		document.getElementById('passeye-toggle-' + i).addEventListener("click", function() {
			if (input.classList.contains("show")) {
				input.type = 'password';
				input.classList.remove("show");
				this.classList.remove("btn-outline-primary");
			} else {
				input.type = 'text';
				input.value = document.getElementById('passeye-' + i).value;
				input.classList.add("show");
				this.classList.add("btn-outline-primary");
			}
		});
	});

	var forms = document.querySelectorAll(".my-login-validation");
	forms.forEach(function(form) {
		form.addEventListener("submit", function(event) {
			if (!form.checkValidity()) {
				event.preventDefault();
				event.stopPropagation();
			}
			form.classList.add('was-validated');
		});
	});
});
const form = document.querySelector('form');
const usernameInput = document.getElementById('text');
const passwordInput = document.getElementById('password');

form.addEventListener('submit', function(event) {

    // Obter os valores inseridos pelo usuário
    const username = usernameInput.value;
    const password = passwordInput.value;


    // Enviar os dados para a API de criação de conta
    axios.post('https://conectadev.vitorgoncalve17.repl.co/singup', {
        Usuario: username,
        Senha: password
    }, {withCredentials: true})
    .then(function(response) {
        if (response.status === 200) {
            alert('Conta criada com sucesso! Você será redirecionado para a página de login.');
            window.location.href = 'login.html';
        } else {
            alert('Erro ao criar conta');
            event.preventDefault();
        }
    })
    .catch(function(error) {
        console.error(error);
        alert('Erro ao criar conta');
        event.preventDefault();
    });
});
