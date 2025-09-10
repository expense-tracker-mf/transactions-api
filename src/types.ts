interface Transaction {
  userId: string;
  amount: number;
  description?: string;
  category: string;
  createdAt: Date;
}

export type { Transaction };
