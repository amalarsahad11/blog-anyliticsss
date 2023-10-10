const express = require('express');
const axios = require('axios');
const _ = require('lodash');
const memoize = require('lodash/memoize');

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());

// Function to fetch blog data from the third-party API
async function fetchBlogData() {
  try {
    const response = await axios.get('https://intent-kit-16.hasura.app/api/rest/blogs', {
      headers: {
        'x-hasura-admin-secret': '32qR4KmXOIpsGPQKMqEJHGJS27G5s7HdSKO3gdtQd2kv5e852SiYwWNfxkZOBuQ6'
      }
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch blog data');
  }
}

// Middleware for data analysis
app.get('/api/blog-stats', async (req, res) => {
  try {
    const blogData = await fetchBlogData();

    // Calculate statistics
    const totalBlogs = blogData.length;
    const longestBlog = _.maxBy(blogData, 'title.length');
    const blogsWithPrivacy = _.filter(blogData, blog => _.includes(_.toLower(blog.title), 'privacy'));
    const uniqueBlogTitles = _.uniqBy(blogData, 'title');

    // Create a response JSON object
    const stats = {
      totalBlogs,
      longestBlog: longestBlog ? longestBlog.title : null,
      blogsWithPrivacy: blogsWithPrivacy.length,
      uniqueBlogTitles: uniqueBlogTitles.map(blog => blog.title)
    };

    res.json(stats);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Middleware for blog search
app.get('/api/blog-search', async (req, res) => {
  try {
    const query = req.query.query.toLowerCase();
    const blogData = await fetchBlogData();

    // Debugging statement
    console.log('Query:', query);

    // Rest of your code
    // ...
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Bonus Challenge: Implement caching using Lodash's memoize function
const cachedFetchAndAnalyzeBlogData = memoize(async () => {
  try {
    const blogData = await fetchBlogData();
    const totalBlogs = blogData.length;
    const longestBlog = _.maxBy(blogData, 'title.length');
    const blogsWithPrivacy = _.filter(blogData, blog => _.includes(_.toLower(blog.title), 'privacy'));
    const uniqueBlogTitles = _.uniqBy(blogData, 'title');

    const stats = {
      totalBlogs,
      longestBlog: longestBlog ? longestBlog.title : null,
      blogsWithPrivacy: blogsWithPrivacy.length,
      uniqueBlogTitles: uniqueBlogTitles.map(blog => blog.title)
    };

    return stats;
  } catch (error) {
    throw new Error('Failed to fetch and analyze blog data');
  }
});

// Middleware for cached data analysis
app.get('/api/blog-stats', async (req, res) => {
  try {
    const blogData = await fetchBlogData();

    // Calculate statistics
    const totalBlogs = blogData.length;

    // Find the blog with the longest title
    const longestBlog = _.maxBy(blogData, blog => blog.title.length);

    // Determine the number of blogs with "privacy" in the title
    const blogsWithPrivacy = _.filter(blogData, blog => _.includes(_.toLower(blog.title), 'privacy'));

    // Create an array of unique blog titles (no duplicates)
    const uniqueBlogTitles = _.uniqBy(blogData, 'title');

    // Create a response JSON object
    const stats = {
      totalBlogs,
      longestBlog: longestBlog ? longestBlog.title : null,
      blogsWithPrivacy: blogsWithPrivacy.length,
      uniqueBlogTitles: uniqueBlogTitles.map(blog => blog.title)
    };

    res.json(stats);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Start the Express server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
