#!/bin/bash
set -e  # exit if any command fails

# Check if pnpm is installed
if ! command -v pnpm >/dev/null 2>&1; then
  echo "❌ pnpm is not installed. Please install it: npm install -g pnpm"
  exit 1
fi

# Check if tsx is installed (locally or globally)
if ! pnpm exec tsx --version >/dev/null 2>&1; then
  echo "❌ tsx is not installed. Run: pnpm add -D tsx"
  exit 1
fi

echo "Generating ABIs..."

amm_abi=$(pnpm tsx scripts/generateAmmABI.ts)
echo "AMM ABI generated"
echo "$amm_abi" > src/core/ammAbi.ts
echo "AMM ABI stored"

aux_abi=$(pnpm tsx scripts/generateAuxABI.ts)
echo "Aux ABI generated"
echo "$aux_abi" > src/core/auxAbi.ts
echo "Aux ABI stored"

governance_abi=$(pnpm tsx scripts/generateGovernanceABI.ts)
echo "Governance ABI generated"
echo "$governance_abi" > src/governance/governanceAbi.ts
echo "Governance ABI stored"

erc20_abi=$(pnpm tsx scripts/generateErc20ABI.ts)
echo "ERC20 ABI generated"
echo "$erc20_abi" > src/core/erc20Abi.ts
echo "ERC20 ABI stored"

echo "Done!"
