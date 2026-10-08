export function createPostController({ createPost, getPost, listPosts }) {
  return {
    async create(req, res) {
      const post = await createPost.execute(req.body ?? {});
      res.status(201).json(post);
    },

    async getById(req, res) {
      const post = await getPost.execute(req.params.id);
      res.status(200).json(post);
    },

    async list(req, res) {
      const posts = await listPosts.execute();
      res.status(200).json(posts);
    },
  };
}
