const OPEN_STATUSES = new Set(['RESERVED', 'ACTIVE', 'OVERDUE']);

function toDateOnly(date) {
  return date.toISOString().slice(0, 10);
}

function toNumber(decimal) {
  return decimal === null || decimal === undefined ? undefined : Number(decimal);
}

/**
 * Maps a real booking transaction (Prisma `Rental`, with its `item`
 * relation included) to the frontend's flat `Rental` shape. Used by
 * `GET /rentals/mine`, where `id` is the actual rental/transaction id —
 * a user (or an admin looking system-wide) may have several historical
 * rentals of the very same item, each a distinct row.
 */
export function toRentalDTO(rental) {
  return {
    id: rental.id,
    itemName: rental.item.name,
    category: rental.item.category,
    branch: rental.branchId,
    dailyRate: toNumber(rental.item.dailyRate),
    status: rental.status.toLowerCase(),
    startDate: toDateOnly(rental.startDate),
    dueDate: toDateOnly(rental.dueDate),
    ...(rental.returnedAt ? { returnedDate: toDateOnly(rental.returnedAt) } : {}),
    ...(rental.lateFee !== null && rental.lateFee !== undefined
      ? { lateFee: toNumber(rental.lateFee) }
      : {}),
  };
}

export function toRentalDTOList(rentals) {
  return rentals.map(toRentalDTO);
}

/**
 * Maps an `Item` (rental inventory) to the frontend's `Rental` shape for
 * the "browse available inventory" screen (`GET /rentals/available` and
 * `POST /rentals/:itemId/request`).
 *
 * IMPORTANT compatibility note: the frontend (`BrowseRentals.tsx`) only
 * ever branches on `status === 'reserved'` to disable the "request"
 * button, and re-keys its local list by `r.id` after a request succeeds.
 * There is no separate "available" status in the frontend's `RentalStatus`
 * union, so this endpoint deliberately reports `id` as the *item's* id
 * (not a transaction id) and reports `status: 'returned'` for inventory
 * that is currently free to book — "returned" being the closest existing
 * status to "back on the shelf, ready to go out again". Once a rental is
 * requested against the item, this same mapper reports `status:
 * 'reserved'`, matching what the UI expects to see and disable on.
 *
 * @param {object} item - Prisma `Item`, optionally with its most recent
 *   `rentals` entry included (`{ rentals: { take: 1, orderBy: { createdAt: 'desc' } } }`).
 */
export function toBookableItemDTO(item) {
  const latest = item.rentals?.[0];
  const isOpen = latest && OPEN_STATUSES.has(latest.status);

  if (latest) {
    return {
      id: item.id,
      itemName: item.name,
      category: item.category,
      branch: item.branchId,
      dailyRate: toNumber(item.dailyRate),
      status: isOpen ? latest.status.toLowerCase() : 'returned',
      startDate: toDateOnly(latest.startDate),
      dueDate: toDateOnly(latest.dueDate),
      ...(latest.returnedAt ? { returnedDate: toDateOnly(latest.returnedAt) } : {}),
      ...(latest.lateFee !== null && latest.lateFee !== undefined
        ? { lateFee: toNumber(latest.lateFee) }
        : {}),
    };
  }

  // Brand-new item, never rented — available, with today's date standing
  // in for start/due since no real booking window exists yet.
  const today = toDateOnly(new Date());
  return {
    id: item.id,
    itemName: item.name,
    category: item.category,
    branch: item.branchId,
    dailyRate: toNumber(item.dailyRate),
    status: 'returned',
    startDate: today,
    dueDate: today,
  };
}

export function toBookableItemDTOList(items) {
  return items.map(toBookableItemDTO);
}
