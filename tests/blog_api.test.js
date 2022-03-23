const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')

const app = require('../app')
const Blog = require('../models/blog')
const api = supertest(app)

beforeEach(async () => {
  await Blog.deleteMany({})

  const blogObjects = helper.listWithManyBlogs
    .map(blog => new Blog(blog))
  const promiseArray = blogObjects.map(blog => blog.save())
  await Promise.all(promiseArray)
})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
}, 100000)

test('all blogs are returned', async () => {
  const blogs = await helper.blogsInDb()
  expect(blogs).toHaveLength(helper.listWithManyBlogs.length)
})

test('a specific blog is within the returned blogs', async () => {
  const blogs = await helper.blogsInDb()
  const titles = blogs.map(blog => blog.title)

  expect(titles).toContain(
    'React patterns'
  )
})

test('a valid blog can be added', async () => {
  const newBlog = {
    title: 'a new title',
    author: 'fake name',
    url: 'www.afakeurl.com',
    likes: 0
  }
  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd).toHaveLength(helper.listWithManyBlogs.length + 1)

  const titles = blogsAtEnd.map(blog => blog.title)
  expect(titles).toContain(
    'a new title'
  )
})

test('a blog without a title cannot be added', async () => {
  const newBlog = {
    author: 'fake name',
    url: 'www.afakeurl.com',
    likes: 0
  }
  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)
})

test('a blog without a url cannot be added', async () => {
  const newBlog = {
    title: 'a new title',
    author: 'fake name',
    likes: 0
  }
  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)
})

test('a blog can be added without likes', async () => {
  const newBlog = {
    title: 'a new title',
    author: 'fake name',
    url: 'www.afakeurl.com'
  }

  const response = await api
    .post('/api/blogs')
    .send(newBlog)

  const addedBlog = response.body
  expect(addedBlog.likes).toBe(0)

  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd).toHaveLength(helper.listWithManyBlogs.length + 1)

  const titles = blogsAtEnd.map(blog => blog.title)
  expect(titles).toContain(
    'a new title'
  )
})

test('blogs have an id', async () => {
  const blogs = await helper.blogsInDb()
  expect(blogs[0].id).toBeDefined()
})

afterAll(() => {
  mongoose.connection.close()
})

