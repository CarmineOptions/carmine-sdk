import { GOVERNANCE_ADDRESS } from "./../constants";
import { Call } from "starknet";
import { getGovernanceContract } from "../rpc/contracts";
import Decimal from "../utils/decimal";

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

const voteStatusToRaw = (opinion: VoteStatus): string => {
  if (opinion === VoteStatus.Yay) {
    return "1";
  }
  if (opinion === VoteStatus.Nay) {
    // felt252 representation of -1
    return "3618502788666131213697322783095070105623107215331596699973092056135872020480";
  }
  return "0";
};

export const fetchLiveProposals = async () => {
  const gov = getGovernanceContract();
  const res = await gov
    .get_live_proposals()
    .then((res) => res.map((v) => Number(v)));
  return res;
};

export const fetchLiveProposalsWithUserOpinion = async (
  userAddress: string
) => {
  const propIds = await fetchLiveProposals();
  return await fetchUserOpinionForProposals(userAddress, propIds);
};

export const fetchUserVoted = async (
  userAddress: string,
  proposalId: number
): Promise<VoteStatus> => {
  const gov = getGovernanceContract();
  const res = await gov.get_user_voted(userAddress, proposalId);

  if (res === 0n) {
    return VoteStatus.NotVoted;
  }
  if (res === 1n) {
    return VoteStatus.Yay;
  }

  // Nay is -1, which is felt252 overflow:
  // 3618502788666131213697322783095070105623107215331596699973092056135872020480n
  // for simplicity reason we check NotVoted and Yay and then assume Nay
  return VoteStatus.Nay;
};

export const fetchUserOpinionForProposals = async (
  userAddress: string,
  proposalIds: number[]
) => {
  const promises = proposalIds.map((propId) =>
    fetchUserVoted(userAddress, propId)
  );
  const opinions = await Promise.all(promises);

  const result = [];
  for (let i = 0; i < proposalIds.length; i++) {
    const proposalId = proposalIds[i];
    const opinion = opinions[i];
    result.push({ proposalId, opinion });
  }

  return result;
};

export const voteCall = (proposalId: number, opinion: VoteStatus): Call => {
  return {
    entrypoint: "vote",
    contractAddress: GOVERNANCE_ADDRESS,
    calldata: [proposalId, voteStatusToRaw(opinion)],
  };
};

export const fetchVoteCount = async (
  proposalId: number
): Promise<VoteCount> => {
  const factor = new Decimal(10).pow(18);
  const gov = getGovernanceContract();
  const res = await gov.get_vote_counts(proposalId);
  const yayCountRaw = new Decimal(res[0] as bigint);
  const nayCountRaw = new Decimal(res[1] as bigint);

  return {
    yay: yayCountRaw.div(factor).toNumber(),
    nay: nayCountRaw.div(factor).toNumber(),
  };
};

export const fetchVoteCountForProposals = async (proposalIds: number[]) => {
  const promises = proposalIds.map((propId) => fetchVoteCount(propId));
  const counts = await Promise.all(promises);

  const result = [];
  for (let i = 0; i < proposalIds.length; i++) {
    const proposalId = proposalIds[i];
    const count = counts[i];
    result.push({ proposalId, count });
  }

  return result;
};

export const fetchRichLiveProposals = async (
  userAddress?: string
): Promise<RichProposal[]> => {
  const liveProposals = await fetchLiveProposals();

  const opinions =
    userAddress === undefined
      ? // no user, no opinion
        liveProposals.map((_) => undefined)
      : await Promise.all(
          liveProposals.map((propId) => fetchUserVoted(userAddress, propId))
        );

  const counts = await Promise.all(
    liveProposals.map((propId) => fetchVoteCount(propId))
  );

  const result = [];
  for (let i = 0; i < liveProposals.length; i++) {
    const proposalId = liveProposals[i];
    const opinion = opinions[i];
    const count = counts[i];
    result.push({ id: proposalId, count, opinion });
  }
  return result;
};
