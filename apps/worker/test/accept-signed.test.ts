import { describe, expect, it } from "vitest";
import { ComputeBudgetProgram, Keypair, PublicKey, SystemProgram, TransactionInstruction, TransactionMessage, VersionedTransaction } from "@solana/web3.js";
import { acceptSigned, LIGHTHOUSE_PROGRAM_ID, signedDiff } from "../src/launch";

// A create stand-in: what matters is the shape the worker compares, not LaunchLab's data.
const creator = Keypair.generate();
const mint = Keypair.generate();
const feeWallet = Keypair.generate().publicKey;
const program = Keypair.generate().publicKey;
const blockhash = "GHtXQBsoZHVnNFa9YevAzFr17DJjgHXk3ycTKD5xD3Zi";

const createIx = new TransactionInstruction({
  programId: program,
  keys: [
    { pubkey: creator.publicKey, isSigner: true, isWritable: true },
    { pubkey: mint.publicKey, isSigner: true, isWritable: true },
  ],
  data: Buffer.from([1, 2, 3]),
});
const feeIx = SystemProgram.transfer({ fromPubkey: creator.publicKey, toPubkey: feeWallet, lamports: 20_000_000 });

const build = (ixs: TransactionInstruction[]) =>
  new VersionedTransaction(new TransactionMessage({ payerKey: creator.publicKey, recentBlockhash: blockhash, instructions: ixs }).compileToV0Message());
const ours = () => build([ComputeBudgetProgram.setComputeUnitLimit({ units: 300_000 }), createIx, feeIx]);
/** The wallet's answer: its version of the create, signed by the creator only. */
const walletSigns = (ixs: TransactionInstruction[]) => {
  const t = build(ixs);
  t.sign([creator]);
  return Buffer.from(t.serialize()).toString("base64");
};
const guard = (keys: TransactionInstruction["keys"]) => new TransactionInstruction({ programId: LIGHTHOUSE_PROGRAM_ID, keys, data: Buffer.from([7, 0]) });

describe("acceptSigned: what a wallet may change in the create it signs", () => {
  it("takes the create back as it was", () => {
    const back = acceptSigned(walletSigns([ComputeBudgetProgram.setComputeUnitLimit({ units: 300_000 }), createIx, feeIx]), ours(), creator.publicKey, mint);
    expect(back).not.toBeNull();
  });

  it("takes a priority fee and Lighthouse assertions the wallet added, and the mint signs that message (2026-11-02)", () => {
    const b64 = walletSigns([
      ComputeBudgetProgram.setComputeUnitLimit({ units: 340_000 }),
      ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 50_000 }),
      createIx,
      feeIx,
      guard([{ pubkey: creator.publicKey, isSigner: false, isWritable: false }]),
    ]);
    const back = acceptSigned(b64, ours(), creator.publicKey, mint);
    expect(back).not.toBeNull();
    // Both signatures are on it, the mint's over the wallet's message.
    expect(back!.signatures.filter((s) => s.some((b) => b !== 0))).toHaveLength(2);
  });

  it("refuses an instruction from any other program", () => {
    const other = new TransactionInstruction({ programId: Keypair.generate().publicKey, keys: [], data: Buffer.from([0]) });
    const b64 = walletSigns([ComputeBudgetProgram.setComputeUnitLimit({ units: 300_000 }), createIx, feeIx, other]);
    expect(acceptSigned(b64, ours(), creator.publicKey, mint)).toBeNull();
    expect(signedDiff(b64, ours(), creator.publicKey)).toMatchObject({ creatorSigned: true, sameBlockhash: true, added: [other.programId.toBase58()] });
  });

  it("takes a Lighthouse assertion on the new mint, as Phantom adds (2026-11-02)", () => {
    const b64 = walletSigns([createIx, feeIx, guard([{ pubkey: mint.publicKey, isSigner: false, isWritable: false }, { pubkey: creator.publicKey, isSigner: false, isWritable: false }])]);
    const back = acceptSigned(b64, ours(), creator.publicKey, mint);
    expect(back).not.toBeNull();
    expect(signedDiff(b64, ours(), creator.publicKey)).toMatchObject({ added: [LIGHTHOUSE_PROGRAM_ID.toBase58()] });
  });

  it("refuses a create that asks anyone but the creator and the mint to sign", () => {
    const stranger = Keypair.generate();
    const t = build([createIx, feeIx, guard([{ pubkey: stranger.publicKey, isSigner: true, isWritable: false }])]);
    t.sign([creator, stranger]);
    expect(acceptSigned(Buffer.from(t.serialize()).toString("base64"), ours(), creator.publicKey, mint)).toBeNull();
  });

  it("refuses a create whose own instructions changed, even by a lamport", () => {
    const more = SystemProgram.transfer({ fromPubkey: creator.publicKey, toPubkey: feeWallet, lamports: 20_000_001 });
    expect(acceptSigned(walletSigns([createIx, more]), ours(), creator.publicKey, mint)).toBeNull();
  });

  it("checks the Lighthouse address the SDK publishes (docs/VERIFIED.md item 32)", () => {
    expect(LIGHTHOUSE_PROGRAM_ID.equals(new PublicKey("L2TExMFKdjpN9kozasaurPirfHy9P8sbXoAN1qA3S95"))).toBe(true);
  });
});
