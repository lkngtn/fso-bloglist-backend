const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
  return response.json(blogs)
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