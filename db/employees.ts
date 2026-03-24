// ============================================================
// db/employees.ts
// 알바생 데이터를 Firestore에 저장하고 불러오는 함수 모음
// CRUD = Create(추가), Read(조회), Update(수정), Delete(삭제)
// ============================================================

import {
  collection,    // Firestore 컬렉션(폴더 같은 개념)을 가리킬 때 사용
  doc,           // 특정 문서(row 같은 개념)를 가리킬 때 사용
  getDocs,       // 컬렉션 안의 문서 여러 개를 한 번에 가져올 때 사용
  getDoc,        // 특정 문서 하나만 가져올 때 사용
  addDoc,        // 새 문서를 추가할 때 사용 (ID는 Firestore가 자동 생성)
  updateDoc,     // 기존 문서의 일부 필드를 수정할 때 사용
  deleteDoc,     // 문서를 삭제할 때 사용
  query,         // 조건부 쿼리를 만들 때 사용
  orderBy,       // 정렬 조건을 지정할 때 사용
} from "firebase/firestore";

import { db } from "../lib/firebase";           // firebase.ts에서 만들어둔 Firestore 인스턴스
import { Employee, COLLECTIONS } from "./schema"; // 타입 정의와 컬렉션 이름 상수

// -----------------------------------------------------------
// 헬퍼: firstPayDate에서 payDay(일 숫자)를 자동 추출
// 예: "2025-04-05" → 5
// -----------------------------------------------------------
const extractPayDay = (firstPayDate: string): number => {
  // "YYYY-MM-DD"에서 마지막 "-DD" 부분만 잘라서 숫자로 변환
  return parseInt(firstPayDate.split("-")[2], 10);
};

// -----------------------------------------------------------
// 헬퍼: 오늘 날짜를 "YYYY-MM-DD" 형식 문자열로 반환
// -----------------------------------------------------------
const getTodayString = (): string => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0"); // 월은 0부터 시작해서 +1
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

// -----------------------------------------------------------
// [CREATE] 알바생 추가
// 사용 예: addEmployee({ name: "홍길동", startDate: "2025-03-02", ... })
// -----------------------------------------------------------
export const addEmployee = async (
  data: Omit<Employee, "id" | "payDay" | "createdAt"> // id, payDay, createdAt은 자동 생성
): Promise<Employee> => {
  // payDay는 firstPayDate에서 자동 추출 (엄마가 따로 입력 안 해도 됨)
  const payDay = extractPayDay(data.firstPayDate);

  // Firestore에 저장할 최종 데이터 조립
  const newEmployee = {
    ...data,               // 입력받은 필드 (name, startDate, hourlyWage, firstPayDate, accountHint)
    payDay,                // 자동 계산된 월급날 숫자
    createdAt: getTodayString(), // 오늘 날짜를 등록일로 저장
  };

  // Firestore "employees" 컬렉션에 문서 추가
  // addDoc은 ID를 Firestore가 자동으로 만들어줌
  const docRef = await addDoc(
    collection(db, COLLECTIONS.EMPLOYEES),
    newEmployee
  );

  // 저장된 데이터 + Firestore가 생성한 id를 합쳐서 반환
  return { id: docRef.id, ...newEmployee };
};

// -----------------------------------------------------------
// [READ] 알바생 전체 목록 조회 (월급날 빠른 순 정렬)
// 홈 화면에서 알바생 카드 목록을 보여줄 때 사용
// -----------------------------------------------------------
export const getEmployees = async (): Promise<Employee[]> => {
  // payDay 오름차순(1일 → 31일)으로 정렬해서 가져옴
  const q = query(
    collection(db, COLLECTIONS.EMPLOYEES),
    orderBy("payDay", "asc")
  );

  const snapshot = await getDocs(q);

  // snapshot.docs = 문서 배열
  // 각 문서에서 id + 저장된 데이터를 합쳐서 Employee 타입으로 변환
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Employee, "id">),
  }));
};

// -----------------------------------------------------------
// [READ] 알바생 한 명 조회
// 알바생 상세 화면에서 사용
// -----------------------------------------------------------
export const getEmployee = async (employeeId: string): Promise<Employee | null> => {
  const docRef = doc(db, COLLECTIONS.EMPLOYEES, employeeId);
  const snapshot = await getDoc(docRef);

  // 문서가 존재하지 않으면 null 반환
  if (!snapshot.exists()) return null;

  return {
    id: snapshot.id,
    ...(snapshot.data() as Omit<Employee, "id">),
  };
};

// -----------------------------------------------------------
// [UPDATE] 알바생 정보 수정
// 이름, 계좌번호, 월급날 등 일부 필드만 바꿀 때 사용
// 사용 예: updateEmployee("abc123", { name: "김영희" })
// -----------------------------------------------------------
export const updateEmployee = async (
  employeeId: string,
  data: Partial<Omit<Employee, "id" | "createdAt">> // id와 createdAt은 수정 불가
): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.EMPLOYEES, employeeId);

  // firstPayDate가 수정됐다면 payDay도 함께 자동 업데이트
  const updateData = data.firstPayDate
    ? { ...data, payDay: extractPayDay(data.firstPayDate) }
    : data;

  await updateDoc(docRef, updateData);
};

// -----------------------------------------------------------
// [DELETE] 알바생 삭제
// 상세 화면에서 "삭제" 버튼을 눌렀을 때 사용
// ⚠️ 주의: 이 함수는 employees 문서만 삭제함
//   연결된 workLogs, payHistory는 별도로 처리 필요 (추후 구현)
// -----------------------------------------------------------
export const deleteEmployee = async (employeeId: string): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.EMPLOYEES, employeeId);
  await deleteDoc(docRef);
};