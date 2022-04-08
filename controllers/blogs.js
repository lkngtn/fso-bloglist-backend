const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const ObjectId = require('mongoose').Types.ObjectId
const jwt = require('jsonwebtoken')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({}).populate('user', { username: 1, name: 1 })
  return response.json(blogs)
})

blogsRouter.get('/:id', async (request, response) => {
  if (!ObjectId.isValid(request.params.id)) {
    response.status(400).send('invalid id').end()
  }
  const blog = await Blog.findById(request.params.id).populate('user', { username: 1, name: 1 })
  if (blog) {
    response.json(blog)
  } else {
    response.status(404).end()
  }
})

blogsRouter.delete('/:id', async (request, response) => {
  if (!ObjectId.isValid(request.params.id)) {
    response.status(400).send('invalid id').end()
    return
  }

  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!decodedToken.id) {
    response.status(401).json({ error: 'token missing or invalid' }).end()
    return
  }
  const user = await User.findById(decodedToken.id)
  const blogToDelete = await Blog.findById(request.params.id)
  if (!blogToDelete) {
    response.status(204).end()
  } else if (blogToDelete.user.toString() === user.id.toString()) {
    await Blog.findByIdAndDelete(request.params.id)
    response.status(204).end()
  } else {
    response.status(401).json({ error: 'only the creator can delete a blog' })
  }
})

blogsRouter.post('/', async (request, response) => {
  const body = request.body

  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!decodedToken.id) {
    response.status(401).json({ error: 'token missing or invalid' })
  }
  const user = await User.findById(decodedToken.id)

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