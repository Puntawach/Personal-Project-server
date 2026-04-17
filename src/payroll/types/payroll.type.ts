export type AttendanceWithEmployee = {
  employeeId: string;
  normalHours: number;
  otHours: number;
  employee: {
    id: string;
    dailyRate: number | null;
    allowancePerDay: number | null;
  };
};
