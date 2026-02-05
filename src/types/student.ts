export type StudentProfile = {
  id: string;
  email: string;
  role: 'STUDENT';
  balance: number;
  group: {
    id: string;
    name: string;
  } | null;
};
