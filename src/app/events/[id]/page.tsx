import prisma from '../../../../lib/prisma';

interface Post {
  id: string;
  title: string;
}

export default async function Page() {
    // const data = await fetch('https://api.vercel.app/blog')
    // const posts = await data.json()

    const posts = await prisma.post.findMany();

    console.log(posts);
    
    return (
      <ul>
        {posts.map((post: Post) => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
    )
  }