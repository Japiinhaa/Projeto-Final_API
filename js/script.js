// Fazendo a requisição GET
  axios.get('https://conectadev.1gabsfps1.repl.co/posts')
    .then(function (response) {
      const posts = response.data;
      const feedsElement = document.querySelector('.feeds');
      let dataArray = Object.values(posts);
      dataArray.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'feed';
        postElement.innerHTML = `
        <div class="head">
          <div class="user" id="${post.ID}">
                                <div class="profile-photo">
                                    <img src="./images/profile-12.jpg" alt="">
                                </div>
                                <div class="ingo">
                                    <h3>${post.Usuario}</h3>
                                </div>
                                <div>
                                    <p>${post.Conteudo}</p>
                                </div>
                            </div>
                            <span class="edit">
                                <i class="uil uil-ellipsis-h"></i>
                            </span>
                        </div>

                        <div class="photo">
                            <img src="./images/post-1.jpg" alt="">
                        </div>

                        <div class="action-button">
                            <div class="interaction-buttons">
                                <span class="like-button"><i class="uil uil-heart"></i></span>
                                <span><i class="uil uil-comment-dots"></i></span>
                                <span><i class="uil uil-share-alt"></i></span>
                            </div>
                            <div class="bookmark">
                                <span><i class="uil uil-bookmark-full"></i></span>
                            </div>
                        </div>
                        </div>
                        </div>
        `;
        feedsElement.appendChild(postElement);
      });
    })
  
const token = localStorage.getItem('token');

axios.get('https://conectadev.1gabsfps1.repl.co/user',
{
  headers: {
      'Authorization': `${token}` // Adiciona o token ao cabeçalho da requisição
    },
}).then(function(response) {
    const user = response.data;
    const userElement = document.querySelector('.profile');
    userElement.innerHTML = `
                    <div class="profile-photo">
                        <img src="./images/profile-1.jpg" alt="">
                    </div>
                    <div class="handle">
                        <h4>${user.Usuario}</h4>
                        <p class="text-muted">
                            @${user.Usuario}
                        </p>
                    </div>
                    `;
  });

document.querySelectorAll('.like-button').forEach(button => {
    button.addEventListener('click', function() {
      const icon = this.querySelector('i');
      icon.style.color = icon.style.color === 'red' ? '' : 'red';
    });
  });

document.body.addEventListener('click', function(event) {
  if (event.target.matches('.uil.uil-ellipsis-h')) {
    document.querySelector('.modal').classList.add('active');
    document.querySelector('.modal-content').classList.add('active');
  }
});

document.querySelector('.close').addEventListener('click', function() {
    document.querySelector('.modal').classList.remove('active');
    document.querySelector('.modal-content').classList.remove('active');
  });


document.querySelector('body').addEventListener('click', function(event) {
  if (event.target.matches('.uil.uil-ellipsis-h')) {
    const userElement = event.target.parentElement.previousElementSibling;
    const postId = userElement.getAttribute('id');
    localStorage.setItem('postIdToDelete', postId);
  }
});

document.querySelector('.confirm').addEventListener('click', function() {
  const token = localStorage.getItem('token');
  const postId = localStorage.getItem('postIdToDelete');

  axios.delete('https://conectadev.1gabsfps1.repl.co/delete', {
    data: {
      id: postId
    },
    headers: {
      'Authorization': `${token}`
    },
  }).then(function() {
    localStorage.removeItem('postIdToDelete');
    window.location.reload();
  });
});

const createPostInput = document.getElementById("create-post")
const createPostButton= document.getElementById('submit-button');

createPostButton.addEventListener('click', async function(event) {
  event.preventDefault();
  const postContent = createPostInput.value;
  
  if (postContent.trim() !== '') {
    const token = localStorage.getItem('token');

    try {
      await axios.post('https://conectadev.1gabsfps1.repl.co/post', 
      {
        Conteudo: postContent
      },
      {
        headers: {
          'Authorization': `${token}` 
        }
      });
      window.location.reload();
    } catch (error) {
      console.error('Erro ao postar:', error);
    }
  } else {
    console.log('O conteúdo do post não pode ser vazio.');
  }
});
