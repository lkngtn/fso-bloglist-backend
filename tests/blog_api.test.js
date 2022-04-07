const supertest = require('supertest')
const mongoose = require('mongoose')
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

describe('when there is initially some blogs saved', () => {
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

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

  test('a blog will have an id', async () => {
    const blogs = await helper.blogsInDb()
    expect(blogs[0].id).toBeDefined()
  })
})

describe('viewing a specific blog', () => {
  test('succeeds with a valid id', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToView = blogsAtStart[0]
    const resultBlog = await api
      .get(`/api/blogs/${blogToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(resultBlog.body).toEqual(blogToView)
  })

  test('fails with status 404 if blog does not exist', async () => {
    const testId = await helper.nonExistingId()
    await api
      .get(`/api/blogs/${testId}`)
      .expect(404)
  })

  test('fails with status 400 if id is invalid', async () => {
    const testId = 'thisIsNotAValidId'
    await api
      .get(`/api/blogs/${testId}`)
      .expect(400)
  })
})

describe('addition of a new blog', () => {
  test('succeeds with valid data', async () => {
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

  test('succeeds without likes', async () => {
    const newBlog = {
      title: 'a new title',
      author: 'fake name',
      url: 'www.afakeurl.com'
    }

    const response = await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const addedBlog = response.body
    expect(addedBlog.likes).toBe(0)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.listWithManyBlogs.length + 1)

    const titles = blogsAtEnd.map(blog => blog.title)
    expect(titles).toContain(
      'a new title'
    )
  })

  test('fails without a title', async () => {
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

  test('fails without a url', async () => {
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
})

describe('deleting a blog', () => {
  test('succeeds with response status 204 with a valid id', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]
    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(204)
  })

  test('returns status 204 for valid id that does not exit', async () => {
    const testId = await helper.nonExistingId()
    await api
      .delete(`/api/blogs/${testId}`)
      .expect(204)
  })

  test('fails with status 400 with invalid id', async () => {
    const testId = 'thisIsNotAValidId'
    await api
      .delete(`/api/blogs/${testId}`)
      .expect(400)
  })
})

describe('updating an existing blog', () => {
  test('succeeds with valid data', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const testId = blogsAtStart[0].id

    const update = {
      title: 'a new title',
      author: 'fake name',
      url: 'www.afakeurl.com',
      likes: 5
    }
    const response = await api
      .put(`/api/blogs/${testId}`)
      .send(update)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const addedBlog = response.body
    expect(addedBlog.likes).toBe(5)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.listWithManyBlogs.length)

    const titles = blogsAtEnd.map(blog => blog.title)
    expect(titles).toContain(
      'a new title'
    )
  })

  test('succeeds without likes', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const testId = blogsAtStart[0].id

    const update = {
      title: 'a new title',
      author: 'fake name',
      url: 'www.afakeurl.com'
    }
    const response = await api
      .put(`/api/blogs/${testId}`)
      .send(update)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const addedBlog = response.body
    expect(addedBlog.likes).toBe(0)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.listWithManyBlogs.length)

    const titles = blogsAtEnd.map(blog => blog.title)
    expect(titles).toContain(
      'a new title'
    )
  })

  test('fails without a url', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const testId = blogsAtStart[0].id

    const update = {
      title: 'a new title',
      author: 'fake name',
    }
    await api
      .put(`/api/blogs/${testId}`)
      .send(update)
      .expect(400)
  })
})



afterAll(() => {
  mongoose.connection.close()
})

