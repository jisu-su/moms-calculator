/**
 * hooks/usePayCalc.ts
 * 월급 계산을 화면에서 쉽게 쓰도록 감싸는 커스텀 훅
 * - 정산 기간 계산
 * - 총 근무 시간 합산
 * - 월급 계산 (시급 × 시간)
 */

import { useCallback, useEffect, useState } from "react";

import type { Employee, WorkLog } from "../db/schema";
import { getEmployee } from "../db/employees";
import { getWorkLogsByPeriod } from "../db/workLogs";
import { calcPay } from "../utils/payCalc";
import { getPayPeriodByStartDate } from "../utils/dateUtils";

type UsePayCalcResult = {
  periodStart: string | null;
  periodEnd: string | null;
  totalHours: number;
  totalPay: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

type UsePayCalcParams = {
  employeeId?: string;
  targetDate?: string; // "YYYY-MM-DD" 형식 (없으면 오늘 날짜 기준)
};

export function usePayCalc(params: UsePayCalcParams): UsePayCalcResult {
  const { employeeId, targetDate } = params;

  const [periodStart, setPeriodStart] = useState<string | null>(null);
  const [periodEnd, setPeriodEnd] = useState<string | null>(null);
  const [totalHours, setTotalHours] = useState<number>(0);
  const [totalPay, setTotalPay] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // -----------------------------------------------------------
  // 내부 헬퍼: workLogs 배열에서 총 근무 시간 합산
  // -----------------------------------------------------------
  const sumHours = (logs: WorkLog[]): number =>
    logs.reduce((acc, cur) => acc + cur.hours, 0);

  // -----------------------------------------------------------
  // 정산 계산 로직
  // -----------------------------------------------------------
  const refetch = useCallback(async () => {
    if (!employeeId) {
      // employeeId가 없으면 계산할 수 없음
      setPeriodStart(null);
      setPeriodEnd(null);
      setTotalHours(0);
      setTotalPay(0);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1) 알바생 정보 조회 (startDate, hourlyWage 필요)
      const employee = await getEmployee(employeeId);
      if (!employee) {
        setError("알바생 정보를 찾을 수 없습니다.");
        return;
      }

      // 2) 정산 기간 계산 (startDate 기준)
      const today = targetDate ?? new Date().toISOString().slice(0, 10);
      const period = getPayPeriodByStartDate(employee.startDate, today);

      setPeriodStart(period.periodStart);
      setPeriodEnd(period.periodEnd);

      // 3) 정산 기간 내 근무 기록 조회
      const logs = await getWorkLogsByPeriod(
        employeeId,
        period.periodStart,
        period.periodEnd
      );

      // 4) 총 근무 시간 합산
      const hours = sumHours(logs);
      setTotalHours(hours);

      // 5) 월급 계산
      const pay = calcPay(employee.hourlyWage, hours);
      setTotalPay(pay);
    } catch (e) {
      setError("월급 계산에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, [employeeId, targetDate]);

  // -----------------------------------------------------------
  // employeeId 또는 targetDate가 바뀌면 자동 계산
  // -----------------------------------------------------------
  useEffect(() => {
    void refetch();
  }, [refetch]);

  return {
    periodStart,
    periodEnd,
    totalHours,
    totalPay,
    loading,
    error,
    refetch,
  };
}
