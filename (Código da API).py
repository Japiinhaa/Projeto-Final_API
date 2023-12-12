from flask import Flask, jsonify, request, make_response
from flask_cors import CORS
import pandas as pd
import uuid
import os
import jwt as jwt
from datetime import datetime, timezone, timedelta

app = Flask(__name__)
CORS(app, supports_credentials=True)

posts = {}

Usuarios = {}


def verificar_csv():
  csv_path = os.path.join(os.getcwd(), "usuarios.csv")
  if not os.path.exists(csv_path):
    df = pd.DataFrame(columns=["Usuario", "Senha", "Token"])
    df.to_csv(csv_path, index=False)
  else:
    df = pd.read_csv(csv_path)
    for i in df.index:
      Usuarios[df["Usuario"][i]] = {
          "Senha": df["Senha"][i],
          "Token": df["Token"][i]
      }

  csv_path = os.path.join(os.getcwd(), "posts.csv")
  if not os.path.exists(csv_path):
    df = pd.DataFrame(columns=["ID", "Conteudo", "Usuario"])
    df.to_csv(csv_path, index=False)
  else:
    df = pd.read_csv(csv_path)
    for i in df.index:
      posts[df["ID"][i]] = {
          "Conteudo": df["Conteudo"][i],
          "Usuario": df["Usuario"][i],
      }


verificar_csv()


def salvar_csv():
  usuarios_csv_path = os.path.join(os.getcwd(), "usuarios.csv")
  df_usuarios = pd.DataFrame(columns=["Usuario", "Senha", "Token"])
  for i in Usuarios:
    df_usuarios = pd.concat(
        [
            df_usuarios,
            pd.DataFrame({
                "Usuario": [i],
                "Senha": [Usuarios[i]["Senha"]],
                "Token": [Usuarios[i].get("Token", "")],
            }),
        ],
        ignore_index=True,
    )
  df_usuarios.to_csv(usuarios_csv_path, index=False)

  posts_csv_path = os.path.join(os.getcwd(), "posts.csv")
  df_posts = pd.DataFrame(columns=["ID", "Conteudo", "Usuario"])
  for i in posts:
    df_posts = pd.concat(
        [
            df_posts,
            pd.DataFrame({
                "ID": [i],
                "Conteudo": [posts[i]["Conteudo"]],
                "Usuario": [posts[i]["Usuario"]],
            }),
        ],
        ignore_index=True,
    )
  df_posts.to_csv(posts_csv_path, index=False)


# ...


def ler_csv():
  posts_csv_path = os.path.join(os.getcwd(), "posts.csv")
  df = pd.read_csv(posts_csv_path)
  for i in df.index:
    posts[df["ID"][i]] = {
        "Conteudo": df["Conteudo"][i],
        "Usuario": df["Usuario"][i],
    }

  usuarios_csv_path = os.path.join(os.getcwd(), "usuarios.csv")
  df = pd.read_csv(usuarios_csv_path)
  for i in df.index:
    Usuarios[df["Usuario"][i]] = {
        "Senha": df["Senha"][i],
        "Token": df["Token"][i] if "Token" in df.columns else ""
    }


def pegar_usuario(token):
  usuarios_csv_path = os.path.join(os.getcwd(), "usuarios.csv")
  df = pd.read_csv(usuarios_csv_path)

  usuario = df[df['Token'] == token]

  if not usuario.empty:
    return usuario.to_dict(orient='records')[0]

  return None


verificar_csv()
ler_csv()

# ...


@app.route("/login", methods=["POST"])
def login():
  usuario = request.json["Usuario"]
  senha = request.json["Senha"]
  if usuario in Usuarios and Usuarios[usuario]["Senha"] == senha:
    token = jwt.encode(
        {
            "usuario": usuario,
            "exp": datetime.now(timezone.utc) + timedelta(minutes=30)
        },
        "chave-secreta-do-token",
        algorithm="HS256")
    Usuarios[usuario]["Token"] = token
    salvar_csv()  # Salvar o CSV após o login
    return make_response({"token": token}, 200)
  else:
    return make_response("Usuario ou senha incorretos", 401)


@app.route("/singup", methods=['POST'])
def singup():
  usuario = request.json["Usuario"]
  senha = request.json["Senha"]
  if usuario in Usuarios:
    return make_response("Usuario ja cadastrado", 400)
  else:
    Usuarios[usuario] = {"Senha": senha}
    salvar_csv()  # Salvar o CSV após o cadastro
    return make_response("Usuario cadastrado com sucesso", 200)


@app.route("/logout", methods=["POST"])
def logout():
  salvar_csv()  # Salvar o CSV após o logout
  return make_response("Logout bem sucedido", 200)


@app.route("/post", methods=["POST"])
def post():
  token = request.headers.get("Authorization")
  user = None
  for user in Usuarios.values():
    if user.get("Token") == token:
      user = user
      break
  usuario = pegar_usuario(token)
  if not user:
    return make_response("Você precisa estar logado para postar", 401)

  post_id = str(uuid.uuid4())  # Gera um ID único
  post = {
      "ID": post_id,
      "Conteudo": request.json.get("Conteudo", ""),
      "Usuario": usuario["Usuario"],
  }
  posts[post_id] = post
  salvar_csv()
  return make_response("Post criado com sucesso", 200)


@app.route("/delete", methods=["DELETE"])
def delete_post():
  post_id = request.json["id"]
  token = request.headers.get("Authorization")
  usuario = pegar_usuario(token)
  if not usuario:
    return make_response("Você precisa estar logado para deletar um post", 401)
  if posts[post_id]["Usuario"] != usuario["Usuario"]:
    return make_response("Você só pode deletar seus próprios posts", 403)
  del posts[post_id]
  salvar_csv()
  return make_response("Post deletado com sucesso", 200)


@app.route("/edit", methods=["PUT"])
def edit_post():
  post_id = request.json["id"]
  token = request.headers.get("Authorization")
  usuario = pegar_usuario(token)
  if not usuario:
    return make_response("Você precisa estar logado para editar um post", 401)
  if posts[post_id]["Usuario"] != usuario["Usuario"]:
    return make_response("Você só pode editar seus próprios posts", 403)
  posts[post_id]["Conteudo"] = request.json["Conteudo"]
  salvar_csv()  # Salvar o CSV após a edição do post
  return make_response(jsonify(posts[post_id]), 200)


@app.route("/posts", methods=["GET"])
def get_posts():
  posts_reformulados = [{
      "ID": post_id,
      **post_details
  } for post_id, post_details in posts.items()]

  return make_response(jsonify(posts_reformulados), 200)


@app.route("/user", methods=["GET"])
def get_user():
  token = request.headers.get("Authorization")
  usuario = pegar_usuario(token)
  nome_usuario = {
      "Usuario": usuario["Usuario"],
  }

  return make_response(jsonify(nome_usuario), 200)


if __name__ == "__main__":
  app.run(host="0.0.0.0", debug=False)
