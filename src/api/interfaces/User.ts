interface User {
    id: number;
    first: string;
    last: string;
    username: string;
    email: string;
    bio: string;
    followingCount: number;
    followerCount: number;
    // Add other properties as needed
}
  
  // Export the User interface
  export default User;