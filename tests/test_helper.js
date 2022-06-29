/* eslint-disable no-underscore-dangle */
const Blog = require('../models/blog')

const initialBlogs = [
    {
        title: 'Test title3',
        author: 'Gomaa Bin Noriel3',
        url: 'dunno3',
        likes: 3,
    },
    {
        title: 'Test title2',
        author: 'Gomaa Bin Noriel2',
        url: 'dunno2',
        likes: 2,
    },

]

const notExistingId = async () => {
    const blog = new Blog({ author: 'removemeplz', title: 'removemeplz', url: 'removemeplz' })
    await blog.save()
    await blog.remove()

    return blog._id.toString()
}

module.exports = {
    initialBlogs,
    notExistingId,
}
