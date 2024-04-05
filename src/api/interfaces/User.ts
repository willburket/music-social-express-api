interface User {
  id: number;
  first: string;
  last: string;
  username: string;
  email: string;
  bio: string | null;
  followingCount: number;
  followerCount: number;
}

export default User;
