const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const ObjectId = require('mongoose').Types.ObjectId

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({}).populate('user', { username: 1, name: 1 })
  return response.json(blogs)
})

blogsRouter.get('/:id', async (request, response) => {
  if (!ObjectId.isValid(request.params.id)) {
    response.status(400).send('invalid id').end()
  }
  const blog = await Blog.findById(request.params.id)
  if (blog) {
    response.json(blog)
  } else {
    response.status(404).end()
  }
})

blogsRouter.delete('/:id', async (request, response) => {
  if (!ObjectId.isValid(request.params.id)) {
    response.status(400).send('invalid id').end()
  }
  await Blog.findByIdAndDelete(request.params.id)
  response.status(204).end()
})

blogsRouter.post('/', async (request, response) => {
  const body = request.body

  const user = await User.findById(body.userId)

  if (!('likes' in body)) {
    body['likes'] = 0
  }
  if (!('title' in body) || !('url' in body)) {
    return response.status(400).end()
  }

  const blog = new Blog({ user: user._id, ...body })
  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  return response.status(201).json(savedBlog)
})

blogsRouter.put('/:id', async (request, response) => {
  if (!ObjectId.isValid(request.params.id)) {
    response.status(400).send('invalid id').end()
  }
  if (!('likes' in request.body)) {
    request.body['likes'] = 0
  }
  if (!('title' in request.body) || !('url' in request.body)) {
    return response.status(400).end()
  }
  const update = {
    title: request.body.title,
    url: request.body.url,
    likes: request.body.likes
  }
  const savedUpdate = await Blog.findByIdAndUpdate(request.params.id, update, { new: true })
  return response.json(savedUpdate)
})

module.exports = blogsRouter