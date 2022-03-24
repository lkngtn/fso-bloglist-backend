const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const ObjectId = require('mongoose').Types.ObjectId

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
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
  if (!('likes' in request.body)) {
    request.body['likes'] = 0
  }
  if (!('title' in request.body) || !('url' in request.body)) {
    return response.status(400).end()
  }
  const blog = new Blog(request.body)
  const savedBlog = await blog.save()
  return response.status(201).json(savedBlog)
})

module.exports = blogsRouter