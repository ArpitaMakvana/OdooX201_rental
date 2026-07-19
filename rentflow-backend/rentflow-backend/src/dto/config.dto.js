function toNumber(decimal) {
  return Number(decimal);
}

const ROUNDING_TO_FRONTEND = {
  NEAREST_HOUR: 'nearest_hour',
  NEAREST_15: 'nearest_15',
  EXACT: 'exact',
};

export const ROUNDING_TO_DB = {
  nearest_hour: 'NEAREST_HOUR',
  nearest_15: 'NEAREST_15',
  exact: 'EXACT',
};

export function toLateFeePolicyDTO(policy) {
  return {
    gracePeriodMinutes: policy.gracePeriodMinutes,
    hourlyRate: toNumber(policy.hourlyRate),
    dailyMaxLimit: toNumber(policy.dailyMaxLimit),
    roundingLogic: ROUNDING_TO_FRONTEND[policy.roundingLogic],
    autoLockAtAmount: toNumber(policy.autoLockAtAmount),
    autoLockEnabled: policy.autoLockEnabled,
    legalAutoDraftEnabled: policy.legalAutoDraftEnabled,
  };
}
