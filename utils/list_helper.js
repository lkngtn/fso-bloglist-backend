// eslint-disable-next-line no-unused-vars
const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((sum, current) => sum + current.likes, 0)
}

const favoriteBlog = (blogs) => {
  try {
    return blogs.reduce((max, current) => max.likes > current.likes ? max : current)
  } catch {
    return null
  }
}

const mostBlogs = (blogs) => {
  try {
    const authors = blogs.reduce((authors, blog) => {
      if (blog.author in authors) {
        authors[blog.author] += 1
      } else {
        authors[blog.author] = 1
      }
      return authors
    }, {})
    return Object.keys(authors).map(author => {
      return { 'author': author, 'blogs': authors[author] }
    }).reduce((max, current) => max.blogs > current.blogs ? max : current)
  } catch {
    return null
  }
}

const mostLikes = (blogs) => {
  try {
    const authors = blogs.reduce((authors, blog) => {
      if (blog.author in authors) {
        authors[blog.author] += blog.likes
      } else {
        authors[blog.author] = blog.likes
      }
      return authors
    }, {})
    return Object.keys(authors).map(author => {
      return { 'author': author, 'likes': authors[author] }
    }).reduce((max, current) => max.likes > current.likes ? max : current)
  } catch {
    return null
  }
}

module.exports = {
  dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes
}