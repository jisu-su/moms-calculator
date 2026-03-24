// ============================================================
// db/payHistory.ts
// 월급 지급 이력 데이터를 Firestore에 저장하고 불러오는 함수 모음
// 월급을 지급할 때마다 기록을 남겨서 나중에 분쟁 방지용으로 사용
// ============================================================

import {
  collection,
  doc,
  getDocs,
  addDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";

import { db } from "../lib/firebase";
import { PayHistory, COLLECTIONS } from "./schema";

// -----------------------------------------------------------
// [CREATE] 월급 지급 기록 추가
// 엄마가 "송금 완료" 체크를 눌렀을 때 호출
// 사용 예:
//   addPayHistory({
//     employeeId: "abc123",
//     periodStart: "2025-03-02",
//     periodEnd: "2025-04-01",
//     totalHours: 72.5,
//     totalPay: 797500,
//     paidAt: "2025-04-05",
//   })
// -----------------------------------------------------------
export const addPayHistory = async (
  data: Omit<PayHistory, "id"> // id만 자동 생성, 나머지는 모두 직접 전달
): Promise<PayHistory> => {
  const docRef = await addDoc(
    collection(db, COLLECTIONS.PAY_HISTORY),
    data
  );

  return { id: docRef.id, ...data };
};

// -----------------------------------------------------------
// [READ] 특정 알바생의 전체 지급 이력 조회 (최신순 정렬)
// 알바생 상세 화면에서 과거 월급 내역을 볼 때 사용
// 사용 예: getPayHistoryByEmployee("abc123")
// -----------------------------------------------------------
export const getPayHistoryByEmployee = async (
  employeeId: string
): Promise<PayHistory[]> => {
  const q = query(
    collection(db, COLLECTIONS.PAY_HISTORY),
    where("employeeId", "==", employeeId), // 이 알바생의 이력만 필터링
    orderBy("paidAt", "desc")              // 최신 지급일 순으로 정렬 (최근 → 과거)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<PayHistory, "id">),
  }));
};

// -----------------------------------------------------------
// [READ] 특정 알바생의 가장 최근 지급 이력 1건 조회
// 다음 정산 기간 시작일을 계산할 때 사용
// 예: 마지막 지급이 "2025-04-05"였다면 → 다음 정산 시작일 계산 가능
// 사용 예: getLatestPayHistory("abc123")
// -----------------------------------------------------------
export const getLatestPayHistory = async (
  employeeId: string
): Promise<PayHistory | null> => {
  // 전체 이력을 최신순으로 가져온 뒤 첫 번째 항목만 사용
  const history = await getPayHistoryByEmployee(employeeId);

  // 이력이 하나도 없으면 null 반환 (첫 달 월급인 경우)
  if (history.length === 0) return null;

  return history[0]; // 최신순 정렬이므로 첫 번째가 가장 최근 이력
};

// -----------------------------------------------------------
// [DELETE] 특정 지급 이력 1건 삭제
// 잘못 기록된 이력을 지울 때 사용
// -----------------------------------------------------------
export const deletePayHistory = async (payHistoryId: string): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.PAY_HISTORY, payHistoryId);
  await deleteDoc(docRef);
};

// -----------------------------------------------------------
// [DELETE] 특정 알바생의 지급 이력 전체 삭제
// 알바생을 삭제할 때 연결된 지급 이력도 함께 지우기 위해 사용
// employees.ts의 deleteEmployee, workLogs.ts의 deleteWorkLogsByEmployee와
// 함께 호출해야 알바생 관련 데이터가 깔끔하게 정리됨
// -----------------------------------------------------------
export const deletePayHistoryByEmployee = async (
  employeeId: string
): Promise<void> => {
  // 해당 알바생의 모든 지급 이력을 먼저 조회
  const history = await getPayHistoryByEmployee(employeeId);

  // 조회된 이력을 동시에 모두 삭제
  // Promise.all = 여러 삭제 작업을 동시에 처리 (순서대로 하나씩 하면 느림)
  await Promise.all(
    history.map((item) =>
      deleteDoc(doc(db, COLLECTIONS.PAY_HISTORY, item.id))
    )
  );
};