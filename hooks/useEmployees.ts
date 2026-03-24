/**
 * hooks/useEmployees.ts
 * 알바생 데이터를 화면에서 쉽게 쓰도록 감싸는 커스텀 훅
 * - Firestore 직접 호출 대신 이 훅을 통해 접근한다.
 * - loading/error/refetch 패턴을 통일한다.
 */

import { useCallback, useEffect, useState } from "react";

import type { Employee } from "../db/schema";
import {
  addEmployee as addEmployeeApi,
  getEmployees as getEmployeesApi,
  getEmployee as getEmployeeApi,
  updateEmployee as updateEmployeeApi,
  deleteEmployee as deleteEmployeeApi,
} from "../db/employees";
import { deleteWorkLogsByEmployee } from "../db/workLogs";
import { deletePayHistoryByEmployee } from "../db/payHistory";

type UseEmployeesResult = {
  employees: Employee[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  addEmployee: (data: Omit<Employee, "id" | "payDay" | "createdAt">) => Promise<Employee>;
  getEmployee: (employeeId: string) => Promise<Employee | null>;
  updateEmployee: (
    employeeId: string,
    data: Partial<Omit<Employee, "id" | "createdAt">>
  ) => Promise<void>;
  deleteEmployee: (employeeId: string) => Promise<void>;
};

export function useEmployees(): UseEmployeesResult {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // -----------------------------------------------------------
  // 내부 헬퍼: 목록을 다시 불러온다.
  // -----------------------------------------------------------
  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const list = await getEmployeesApi();
      setEmployees(list);
    } catch (e) {
      setError("알바생 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  // -----------------------------------------------------------
  // 화면이 처음 열릴 때 자동으로 목록을 가져온다.
  // -----------------------------------------------------------
  useEffect(() => {
    void refetch();
  }, [refetch]);

  // -----------------------------------------------------------
  // [CREATE] 알바생 추가 후 목록 갱신
  // -----------------------------------------------------------
  const addEmployee = useCallback(
    async (data: Omit<Employee, "id" | "payDay" | "createdAt">) => {
      setLoading(true);
      setError(null);

      try {
        const created = await addEmployeeApi(data);
        // 새로 만든 데이터를 목록에 합친다.
        setEmployees((prev) => [created, ...prev]);
        return created;
      } catch (e) {
        setError("알바생 추가에 실패했습니다.");
        throw e;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // -----------------------------------------------------------
  // [READ] 알바생 1명 조회
  // -----------------------------------------------------------
  const getEmployee = useCallback(async (employeeId: string) => {
    try {
      return await getEmployeeApi(employeeId);
    } catch (e) {
      setError("알바생 정보를 불러오지 못했습니다.");
      return null;
    }
  }, []);

  // -----------------------------------------------------------
  // [UPDATE] 알바생 수정 후 목록 갱신
  // -----------------------------------------------------------
  const updateEmployee = useCallback(
    async (
      employeeId: string,
      data: Partial<Omit<Employee, "id" | "createdAt">>
    ) => {
      setLoading(true);
      setError(null);

      try {
        await updateEmployeeApi(employeeId, data);
        // 목록을 최신으로 다시 불러온다.
        await refetch();
      } catch (e) {
        setError("알바생 수정에 실패했습니다.");
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [refetch]
  );

  // -----------------------------------------------------------
  // [DELETE] 알바생 삭제
  // - employees 문서 삭제
  // - 연결된 workLogs/payHistory도 함께 삭제
  // -----------------------------------------------------------
  const deleteEmployee = useCallback(
    async (employeeId: string) => {
      setLoading(true);
      setError(null);

      try {
        // 1) 연결된 근무 기록 삭제
        await deleteWorkLogsByEmployee(employeeId);
        // 2) 연결된 월급 이력 삭제
        await deletePayHistoryByEmployee(employeeId);
        // 3) 알바생 문서 삭제
        await deleteEmployeeApi(employeeId);

        // 목록 갱신
        setEmployees((prev) => prev.filter((e) => e.id !== employeeId));
      } catch (e) {
        setError("알바생 삭제에 실패했습니다.");
        throw e;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    employees,
    loading,
    error,
    refetch,
    addEmployee,
    getEmployee,
    updateEmployee,
    deleteEmployee,
  };
}
