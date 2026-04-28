# Sole Security Specification

## Data Invariants
1. A **User** document must be created by the owner and the `uid` must match `request.auth.uid`.
2. A **Bank** account must have a `userId` matching the creator's `uid`.
3. A **Transaction** must reference a valid `bankId` and the `userId` must match the creator's `uid`.
4. A **Budget** must have a `userId` matching the creator's `uid`.
5. All IDs must be alpha-numeric and within length limits.
6. Amounts in `Transaction` must be positive.
7. `createdAt` must be set to server timestamp on creation and remain immutable.

## The Dirty Dozen Payloads (Rejection Targets)

1. **Identity Spoofing**: Attempt to create a bank account with another user's `userId`.
2. **Orphaned Transaction**: Create a transaction for a `bankId` that doesn't exist.
3. **Cross-User Transaction**: Create/Update a transaction for a `bankId` that belongs to someone else.
4. **Invalid Balance**: Create a bank account with a negative initial balance (if strictly required, otherwise just type checking).
5. **PII Leak**: Get a user's private profile (email) as another authenticated user.
6. **Shadow Update**: Add an `isVerified: true` field to a bank account in an update.
7. **Negative Transaction**: Set a transaction `amount` to a negative number.
8. **Admin Injection**: Attempt to set an `isAdmin` field in the user profile.
9. **Terminal State Break**: (Not applicable yet, but let's say "archived" banks cannot be updated).
10. **Timestamp Fraud**: Provide a manual `createdAt` date from the future.
11. **Huge Data Poisoning**: Create an account name with 1MB of text.
12. **Query Scraping**: Attempt to `list` all transactions without a `userId` filter.

## Test Runner (Logic Check)
The tests will verify that `PERMISSION_DENIED` is returned for all of the above.
