# Post-feature workflow

After shipping a **user-visible feature** or **coherent batch**.

## Steps

1. Run tests for touched packages.
2. Update [features.md](../../docs/product/features.md) if user-visible.
3. Update [current-state.md](../current-state.md) (Recent changes + gaps).
4. Quick pass [code-review.md](../feedback/code-review.md) (abbreviated OK).
5. Commit only if user requested — see [agent-contracts.md](../agent-contracts.md).

## Optional

- Invoke matching review skill (security for proxy, vapix for Axis).
- Add E2E if new critical operator path.
