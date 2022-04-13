const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const ObjectId = require('mongoose').Types.ObjectId
const middleware = require('../utils/middleware')

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

blogsRouter.delete('/:id', middleware.userExtractor, async (request, response) => {
  if (!ObjectId.isValid(request.params.id)) {
    response.status(400).send('invalid id').end()
    return
  }

  const user = request.user

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

blogsRouter.post('/', middleware.userExtractor, async (request, response) => {
  const body = request.body
  const user = request.user

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
    author: request.body.author,
    likes: request.body.likes,
    user: request.body.user
  }
  const savedUpdate = await Blog.findByIdAndUpdate(request.params.id, update, { new: true })
  return response.json(savedUpdate)
})

module.exports = blogsRouter