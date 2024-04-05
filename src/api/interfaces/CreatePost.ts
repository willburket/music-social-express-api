interface CreatePost {
  userId: number;
  username: string;
  content: string;
  reply: boolean;
  replyTo: number | null;
}

export default CreatePost;
