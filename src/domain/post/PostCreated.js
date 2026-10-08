// Domain event: a fact that already happened. Plain data, no behaviour.
export const POST_CREATED = 'PostCreated';

export function postCreated(post) {
  return {
    eventType: POST_CREATED,
    postId: post.id,
    title: post.title,
    createdAt: post.createdAt.toISOString(),
  };
}
