interface SignUpUser {
  email: string;
  password: string;
  first: string;
  last: string;
  username: string;
  bio: string | null;
  followingCount: number;
  followerCount: number;
}

export default SignUpUser;
