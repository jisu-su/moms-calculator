// ============================================================
// db/workLogs.ts
// 근무 기록 데이터를 Firestore에 저장하고 불러오는 함수 모음
// ============================================================

import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,    // 특정 조건에 맞는 문서만 필터링할 때 사용 (예: 특정 알바생의 기록만)
  orderBy,
} from "firebase/firestore";

import { db } from "../lib/firebase";
import { WorkLog, COLLECTIONS } from "./schema";

// -----------------------------------------------------------
// 헬퍼: "HH:MM" 형식 두 시간의 차이를 시간(소수) 단위로 계산
// 예: "09:00" ~ "13:30" → 4.5 (시간)
// -----------------------------------------------------------
const calcHours = (startTime: string, endTime: string): number => {
  // "HH:MM"을 ":"로 나눠서 시(hour)와 분(minute)을 각각 숫자로 변환
  const [startHour, startMin] = startTime.split(":").map(Number);
  const [endHour, endMin] = endTime.split(":").map(Number);

  // 시간을 분 단위로 통일한 뒤 빼기
  const totalMinutes = (endHour * 60 + endMin) - (startHour * 60 + startMin);

  // 분 → 시간으로 다시 변환 (소수점 포함, 예: 270분 → 4.5시간)
  return totalMinutes / 60;
};

// -----------------------------------------------------------
// [CREATE] 근무 기록 추가
// 사용 예: addWorkLog({ employeeId: "abc", date: "2025-03-15", startTime: "09:00", endTime: "18:00" })
// -----------------------------------------------------------
export const addWorkLog = async (
  data: Omit<WorkLog, "id" | "hours"> // id는 자동 생성, hours는 자동 계산
): Promise<WorkLog> => {
  // 출퇴근 시간으로 근무 시간 자동 계산 (엄마가 따로 입력 안 해도 됨)
  const hours = calcHours(data.startTime, data.endTime);

  const newWorkLog = {
    ...data,  // employeeId, date, startTime, endTime
    hours,    // 자동 계산된 근무 시간
  };

  const docRef = await addDoc(
    collection(db, COLLECTIONS.WORK_LOGS),
    newWorkLog
  );

  return { id: docRef.id, ...newWorkLog };
};

// -----------------------------------------------------------
// [READ] 특정 알바생의 근무 기록 전체 조회 (날짜 오름차순)
// 알바생 상세 화면에서 미니 달력에 점을 찍을 때 사용
// 사용 예: getWorkLogsByEmployee("abc123")
// -----------------------------------------------------------
export const getWorkLogsByEmployee = async (
  employeeId: string
): Promise<WorkLog[]> => {
  const q = query(
    collection(db, COLLECTIONS.WORK_LOGS),
    where("employeeId", "==", employeeId), // 이 알바생의 기록만 필터링
    orderBy("date", "asc")                 // 날짜 오름차순 정렬 (오래된 날짜 → 최근)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<WorkLog, "id">),
  }));
};

// -----------------------------------------------------------
// [READ] 특정 알바생의 정산 기간 내 근무 기록 조회
// 월급 계산할 때 사용 — 정산 기간(periodStart ~ periodEnd) 안의 기록만 가져옴
// 사용 예: getWorkLogsByPeriod("abc123", "2025-03-02", "2025-04-01")
// -----------------------------------------------------------
export const getWorkLogsByPeriod = async (
  employeeId: string,
  periodStart: string, // 정산 시작일 "YYYY-MM-DD"
  periodEnd: string    // 정산 종료일 "YYYY-MM-DD"
): Promise<WorkLog[]> => {
  const q = query(
    collection(db, COLLECTIONS.WORK_LOGS),
    where("employeeId", "==", employeeId),
    where("date", ">=", periodStart), // 정산 시작일 이후
    where("date", "<=", periodEnd),   // 정산 종료일 이전
    orderBy("date", "asc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<WorkLog, "id">),
  }));
};

// -----------------------------------------------------------
// [READ] 특정 날짜에 근무한 알바생 기록 전체 조회
// 달력 화면에서 날짜를 탭했을 때 "이날 일한 사람 목록" 보여줄 때 사용
// 사용 예: getWorkLogsByDate("2025-03-15")
// -----------------------------------------------------------
export const getWorkLogsByDate = async (
  date: string // "YYYY-MM-DD"
): Promise<WorkLog[]> => {
  const q = query(
    collection(db, COLLECTIONS.WORK_LOGS),
    where("date", "==", date) // 이 날짜의 기록만 필터링
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<WorkLog, "id">),
  }));
};

// -----------------------------------------------------------
// [UPDATE] 근무 기록 수정
// 알바생 상세에서 특정 날짜의 출퇴근 시간을 수정할 때 사용
// 시간이 바뀌면 hours도 자동으로 재계산
// -----------------------------------------------------------
export const updateWorkLog = async (
  workLogId: string,
  data: Partial<Omit<WorkLog, "id" | "hours">> // hours는 항상 자동 계산
): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.WORK_LOGS, workLogId);

  // startTime 또는 endTime이 수정됐다면 hours도 함께 재계산
  // 단, 둘 다 있어야 계산 가능하므로 둘 다 있는 경우에만 처리
  if (data.startTime && data.endTime) {
    const hours = calcHours(data.startTime, data.endTime);
    await updateDoc(docRef, { ...data, hours });
  } else {
    await updateDoc(docRef, data);
  }
};

// -----------------------------------------------------------
// [DELETE] 근무 기록 삭제
// 특정 날짜의 근무 기록을 잘못 입력했을 때 삭제
// -----------------------------------------------------------
export const deleteWorkLog = async (workLogId: string): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.WORK_LOGS, workLogId);
  await deleteDoc(docRef);
};

// -----------------------------------------------------------
// [DELETE] 특정 알바생의 근무 기록 전체 삭제
// 알바생을 삭제할 때 연결된 근무 기록도 함께 지우기 위해 사용
// employees.ts의 deleteEmployee와 함께 호출해야 함
// -----------------------------------------------------------
export const deleteWorkLogsByEmployee = async (
  employeeId: string
): Promise<void> => {
  // 해당 알바생의 모든 근무 기록을 먼저 조회
  const logs = await getWorkLogsByEmployee(employeeId);

  // 조회된 기록을 하나씩 삭제
  // Promise.all = 여러 삭제 작업을 동시에 처리 (순서대로 하나씩 하면 느림)
  await Promise.all(
    logs.map((log) => deleteDoc(doc(db, COLLECTIONS.WORK_LOGS, log.id)))
  );
};