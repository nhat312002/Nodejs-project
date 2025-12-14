export interface Comment {
  id: number;
  postId: number;
  userId: number;
  parentId: number | null;
  content: string;
  createdAt: string;
  updatedAt: string;

  user: {
    id: number;
    fullName: string;
    avatarUrl?: string;
  };

  replies?: Comment[];
}
