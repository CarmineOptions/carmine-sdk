import { Call, Contract, TypedContractV2 } from "starknet";
import { getProvider } from "../core/provider";
import { GOVERNANCE_ADDRESS } from "../core/constants";
import { governanceAbi } from "./governanceAbi";
import { RichProposal, VoteCount, VoteStatus } from "./types";
import Decimal from "../core/decimal";

export namespace Governance {
  // Lazily created contract instance
  let _contract: TypedContractV2<typeof governanceAbi> | undefined;

  function contract(): TypedContractV2<typeof governanceAbi> {
    if (!_contract) {
      const provider = getProvider();
      _contract = new Contract({
        abi: governanceAbi,
        address: GOVERNANCE_ADDRESS,
        providerOrAccount: provider,
      }).typedv2(governanceAbi);
    }
    return _contract;
  }

  function voteStatusToRaw(opinion: VoteStatus): string {
    if (opinion === VoteStatus.Yay) {
      return "1";
    }
    if (opinion === VoteStatus.Nay) {
      // felt252 representation of -1
      return "3618502788666131213697322783095070105623107215331596699973092056135872020480";
    }
    return "0";
  }

  export async function getLiveProposals(): Promise<number[]> {
    return await contract()
      .get_live_proposals()
      .then((r) => r.map((v) => Number(v)));
  }

  export const getUserVoted = async (
    userAddress: string,
    proposalId: number
  ): Promise<VoteStatus> => {
    const res = await contract().get_user_voted(userAddress, proposalId);

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

  export const getUserOpinionForProposals = async (
    userAddress: string,
    proposalIds: number[]
  ) => {
    const promises = proposalIds.map((propId) =>
      getUserVoted(userAddress, propId)
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

  export async function getLiveProposalsWithUserOpinion(userAddress: string) {
    const propIds = await getLiveProposals();
    return await getUserOpinionForProposals(userAddress, propIds);
  }

  export const voteCall = (proposalId: number, opinion: VoteStatus): Call => {
    return {
      entrypoint: "vote",
      contractAddress: GOVERNANCE_ADDRESS,
      calldata: [proposalId, voteStatusToRaw(opinion)],
    };
  };

  export const getVoteCount = async (
    proposalId: number
  ): Promise<VoteCount> => {
    const factor = new Decimal(10).pow(18);
    const res = await contract().get_vote_counts(proposalId);
    const yayCountRaw = new Decimal(res[0] as bigint);
    const nayCountRaw = new Decimal(res[1] as bigint);

    return {
      yay: yayCountRaw.div(factor).toNumber(),
      nay: nayCountRaw.div(factor).toNumber(),
    };
  };

  export const getVoteCountForProposals = async (proposalIds: number[]) => {
    const promises = proposalIds.map((propId) => getVoteCount(propId));
    const counts = await Promise.all(promises);

    const result = [];
    for (let i = 0; i < proposalIds.length; i++) {
      const proposalId = proposalIds[i];
      const count = counts[i];
      result.push({ proposalId, count });
    }

    return result;
  };

  export const getRichLiveProposals = async (
    userAddress?: string
  ): Promise<RichProposal[]> => {
    const liveProposals = await getLiveProposals();

    const opinions =
      userAddress === undefined
        ? // no user, no opinion
          liveProposals.map((_) => undefined)
        : await Promise.all(
            liveProposals.map((propId) => getUserVoted(userAddress, propId))
          );

    const counts = await Promise.all(
      liveProposals.map((propId) => getVoteCount(propId))
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
}
