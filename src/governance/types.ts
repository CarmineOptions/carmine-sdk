export enum VoteStatus {
  Nay = "nay",
  Yay = "yay",
  NotVoted = "not-voted",
}

export type VoteCount = {
  yay: number;
  nay: number;
};

/**
 * id - proposal id
 * count - yay and nay votes so far
 * opinion - user opinion, undefined if no user address was provided
 */
export type RichProposal = {
  id: number;
  count: VoteCount;
  opinion?: VoteStatus;
};
