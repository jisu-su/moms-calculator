/**
 * hooks/useWorkLogs.ts
 * 근무 기록을 화면에서 쉽게 쓰도록 감싸는 커스텀 훅
 * - 특정 알바생의 기록 목록을 관리한다.
 * - 기간/날짜 조회 헬퍼도 제공한다.
 */

import { useCallback, useEffect, useState } from "react";

import type { WorkLog } from "../db/schema";
import {
  addWorkLog as addWorkLogApi,
  getWorkLogsByEmployee as getWorkLogsByEmployeeApi,
  getWorkLogsByPeriod as getWorkLogsByPeriodApi,
  getWorkLogsByDate as getWorkLogsByDateApi,
  updateWorkLog as updateWorkLogApi,
  deleteWorkLog as deleteWorkLogApi,
} from "../db/workLogs";

type UseWorkLogsResult = {
  workLogs: WorkLog[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  addWorkLog: (data: Omit<WorkLog, "id" | "hours">) => Promise<WorkLog>;
  updateWorkLog: (
    workLogId: string,
    data: Partial<Omit<WorkLog, "id" | "hours">>
  ) => Promise<void>;
  deleteWorkLog: (workLogId: string) => Promise<void>;
  getLogsByPeriod: (
    employeeId: string,
    periodStart: string,
    periodEnd: string
  ) => Promise<WorkLog[]>;
  getLogsByDate: (date: string) => Promise<WorkLog[]>;
};

// -----------------------------------------------------------
// employeeId를 넘기면 해당 알바생 기록을 자동으로 불러온다.
// -----------------------------------------------------------
export function useWorkLogs(employeeId?: string): UseWorkLogsResult {
  const [workLogs, setWorkLogs] = useState<WorkLog[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // -----------------------------------------------------------
  // 내부 헬퍼: 현재 employeeId 기준으로 목록을 다시 불러온다.
  // -----------------------------------------------------------
  const refetch = useCallback(async () => {
    if (!employeeId) {
      setWorkLogs([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const list = await getWorkLogsByEmployeeApi(employeeId);
      setWorkLogs(list);
    } catch (e) {
      setError("근무 기록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  // -----------------------------------------------------------
  // employeeId가 바뀌면 자동으로 다시 불러온다.
  // -----------------------------------------------------------
  useEffect(() => {
    void refetch();
  }, [refetch]);

  // -----------------------------------------------------------
  // [CREATE] 근무 기록 추가
  // -----------------------------------------------------------
  const addWorkLog = useCallback(
    async (data: Omit<WorkLog, "id" | "hours">) => {
      setLoading(true);
      setError(null);

      try {
        const created = await addWorkLogApi(data);
        setWorkLogs((prev) => [created, ...prev]);
        return created;
      } catch (e) {
        setError("근무 기록 추가에 실패했습니다.");
        throw e;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // -----------------------------------------------------------
  // [UPDATE] 근무 기록 수정
  // -----------------------------------------------------------
  const updateWorkLog = useCallback(
    async (
      workLogId: string,
      data: Partial<Omit<WorkLog, "id" | "hours">>
    ) => {
      setLoading(true);
      setError(null);

      try {
        await updateWorkLogApi(workLogId, data);
        await refetch();
      } catch (e) {
        setError("근무 기록 수정에 실패했습니다.");
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [refetch]
  );

  // -----------------------------------------------------------
  // [DELETE] 근무 기록 삭제
  // -----------------------------------------------------------
  const deleteWorkLog = useCallback(
    async (workLogId: string) => {
      setLoading(true);
      setError(null);

      try {
        await deleteWorkLogApi(workLogId);
        setWorkLogs((prev) => prev.filter((log) => log.id !== workLogId));
      } catch (e) {
        setError("근무 기록 삭제에 실패했습니다.");
        throw e;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // -----------------------------------------------------------
  // [READ] 정산 기간 기준 조회
  // -----------------------------------------------------------
  const getLogsByPeriod = useCallback(
    async (id: string, periodStart: string, periodEnd: string) => {
      try {
        return await getWorkLogsByPeriodApi(id, periodStart, periodEnd);
      } catch (e) {
        setError("정산 기간 기록 조회에 실패했습니다.");
        return [];
      }
    },
    []
  );

  // -----------------------------------------------------------
  // [READ] 특정 날짜 기준 조회 (달력 화면용)
  // -----------------------------------------------------------
  const getLogsByDate = useCallback(async (date: string) => {
    try {
      return await getWorkLogsByDateApi(date);
    } catch (e) {
      setError("날짜별 기록 조회에 실패했습니다.");
      return [];
    }
  }, []);

  return {
    workLogs,
    loading,
    error,
    refetch,
    addWorkLog,
    updateWorkLog,
    deleteWorkLog,
    getLogsByPeriod,
    getLogsByDate,
  };
}
