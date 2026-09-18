export type Move = {
  id: number;
  fenFrom: string;
  fenTo: string;
  uci: string;
  evaluation: number | null;
};

export type CreateMove = {
  fenFrom: string;
  fenTo: string;
  uci: string;
  evaluation?: number | null;
};
