const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(us => us.username === username);

  if(!user)
    return response.status(404).json({error: "Usuário não enontrado"})

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const {name, username} = request.body;

  const existUser = users.find(user => user.username === username);

  if(existUser)
    return response.status(400).json({error: "Usuário já cadastrado"});

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(newUser);

  response.status(201).json(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.status(200).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {title, deadline} = request.body;
  const {user} = request;

  const newTodo = {
    id: uuidv4(),
    title: title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date()
  }

  const userIndex = users.findIndex(us => us.id === user.id);

  users[userIndex].todos.push(newTodo);

  return response.status(201).json(newTodo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {title, deadline} = request.body;
  const {id} = request.params;
  const {user} = request;

  const userIndex = users.findIndex(us => us.id === user.id);
  const todoIndex = users[userIndex].todos.findIndex(todo => todo.id === id);

  if(todoIndex < 0)
    return response.status(404).json({error: "Todo não encontrado"})

  users[userIndex].todos[todoIndex].title = title;
  users[userIndex].todos[todoIndex].deadline = new Date(deadline);

  return response.status(200).json(users[userIndex].todos[todoIndex]);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {id} = request.params;
  const {user} = request;

  const userIndex = users.findIndex(us => us.id === user.id);
  const todoIndex = users[userIndex].todos.findIndex(todo => todo.id === id);

  if(todoIndex < 0)
    return response.status(404).json({error: "Todo não encontrado"})

  users[userIndex].todos[todoIndex].done = true;

  return response.status(200).json(users[userIndex].todos[todoIndex]);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {id} = request.params;
  const {user} = request;

  const userIndex = users.findIndex(us => us.id === user.id);
  const todoIndex = users[userIndex].todos.findIndex(todo => todo.id === id);

  if(todoIndex < 0)
    return response.status(404).json({error: "Todo não encontrado"})

  users[userIndex].todos.splice(todoIndex, 1);

  return response.status(204).send();
});

module.exports = app;