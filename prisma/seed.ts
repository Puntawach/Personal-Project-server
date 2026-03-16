import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';
import {
  PrismaClient,
  Prisma,
  AttendanceStatus,
} from '../src/database/generated/prisma/client';

dotenv.config();

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function citizenId() {
  return String(Math.floor(1000000000000 + Math.random() * 9000000000000));
}

const names = [
  ['สมชาย', 'ใจดี'],
  ['สมหญิง', 'รักดี'],
  ['ประสิทธิ์', 'มานะ'],
  ['ณรงค์', 'ขยัน'],
  ['สมศักดิ์', 'ตั้งใจ'],
  ['สมบูรณ์', 'ดีงาม'],
  ['ไพโรจน์', 'สุขใจ'],
  ['กมล', 'แสงทอง'],
  ['ชาญ', 'วิทย์'],
  ['พิชัย', 'เก่งงาน'],
  ['รัตนา', 'สว่าง'],
  ['อนันต์', 'เจริญ'],
  ['ศิริ', 'มงคล'],
  ['ธนา', 'มีสุข'],
  ['มานี', 'ดีใจ'],
  ['สุดา', 'ขยัน'],
  ['เพชร', 'ทอง'],
  ['ดาว', 'ฟ้า'],
  ['ฟ้า', 'ดาว'],
  ['นพ', 'รัตน์'],
  ['บุญมี', 'ดีงาม'],
  ['จันทร์', 'งาม'],
  ['วิชัย', 'เด่น'],
  ['นิดา', 'ใฝ่ดี'],
];

async function main() {
  console.log('🧹 clearing database');

  await prisma.checkIn.deleteMany();
  await prisma.reportImage.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.payrollItem.deleteMany();
  await prisma.payrollPeriod.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.team.deleteMany();
  await prisma.site.deleteMany();

  // --------------------
  // TEAMS
  // --------------------

  console.log('👷 creating teams');

  const teams = await prisma.$transaction([
    prisma.team.create({ data: { name: 'Team Alpha' } }),
    prisma.team.create({ data: { name: 'Team Beta' } }),
    prisma.team.create({ data: { name: 'Team Gamma' } }),
  ]);

  // --------------------
  // SITES
  // --------------------

  console.log('🏗 creating sites');

  const sites = await prisma.$transaction([
    prisma.site.create({
      data: {
        name: 'Bangkok Tower Project',
        lat: 13.7563,
        long: 100.5018,
      },
    }),
    prisma.site.create({
      data: {
        name: 'Rama 9 Condo Construction',
        lat: 13.76,
        long: 100.565,
      },
    }),
    prisma.site.create({
      data: {
        name: 'Chiang Mai Mall Expansion',
        lat: 18.7883,
        long: 98.9853,
      },
    }),
  ]);

  // --------------------
  // EMPLOYEES
  // --------------------

  console.log('👥 creating employees');

  const employees: any[] = [];

  for (let i = 0; i < names.length; i++) {
    const name = names[i];

    const employee = await prisma.employee.create({
      data: {
        email: `worker${i}@anc.co.th`,
        password: 'hashedPassword',

        firstName: name[0],
        lastName: name[1],

        phoneNumber: '0812345678',
        address: 'ประเทศไทย',

        identificationId: citizenId(),

        role: 'WORKER',
        status: 'ACTIVE',

        dailyRate: new Prisma.Decimal(rand(450, 700)),
        allowancePerDay: new Prisma.Decimal(rand(40, 120)),

        teamId: teams[i % 3].id,
      },
    });

    employees.push(employee);
  }

  // --------------------
  // TEAM LEADERS
  // --------------------

  console.log('👑 assigning team leaders');

  for (let i = 0; i < teams.length; i++) {
    await prisma.team.update({
      where: { id: teams[i].id },
      data: { leaderId: employees[i].id },
    });
  }

  // --------------------
  // ATTENDANCE
  // --------------------

  console.log('📅 generating attendance');

  const today = new Date();
  const startDate = new Date(today.getFullYear(), today.getMonth() - 2, 1);

  for (const emp of employees) {
    let current = new Date(startDate);

    while (current <= today) {
      const date = new Date(current);
      date.setHours(0, 0, 0, 0);

      if (date.getDay() != 0 && date.getDay() != 6) {
        const hours = rand(7, 10);

        const normal = Math.min(hours, 8);
        const ot = Math.max(hours - 8, 0);

        const attendance = await prisma.attendance.create({
          data: {
            employeeId: emp.id,
            siteId: sites[rand(0, 2)].id,
            workDate: date,
            totalHours: hours,
            normalHours: normal,
            otHours: ot,

            // ✅ แก้ตรงนี้
            status:
              date >=
              new Date(
                today.getFullYear(),
                today.getMonth(),
                today.getDate() - 7,
              )
                ? (
                    [
                      'SUBMITTED',
                      'SUBMITTED',
                      'APPROVED',
                      'REJECTED',
                    ] as AttendanceStatus[]
                  )[rand(0, 3)]
                : 'APPROVED',

            workDescription: 'งานก่อสร้างทั่วไป',
            issues: Math.random() < 0.05 ? 'ฝนตก ทำงานล่าช้า' : null,
          },
        });

        const checkInHour = rand(7, 9);
        const workHours = rand(7, 10);

        const checkInTime = new Date(date);
        checkInTime.setHours(checkInHour, rand(0, 30));

        const checkOutTime = new Date(checkInTime);
        checkOutTime.setHours(checkInTime.getHours() + workHours);

        await prisma.checkIn.create({
          data: {
            attendanceId: attendance.id,
            checkInTime,
            checkOutTime,
          },
        });

        if (Math.random() < 0.2) {
          await prisma.reportImage.create({
            data: {
              attendanceId: attendance.id,
              imageUrl: 'https://picsum.photos/400',
              detail: 'รายงานความคืบหน้างาน',
            },
          });
        }
      }

      current.setDate(current.getDate() + 1);
    }
  }

  // --------------------
  // PAYROLL
  // --------------------

  console.log('💰 calculating payroll');

  const payroll = await prisma.payrollPeriod.create({
    data: {
      month: today.getMonth() + 1,
      year: today.getFullYear(),
    },
  });

  for (const emp of employees) {
    const records = await prisma.attendance.findMany({
      where: {
        employeeId: emp.id,
        status: 'APPROVED',
      },
    });

    const workDays = records.length;

    const normalHours = records.reduce((sum, r) => sum + r.normalHours, 0);
    const otHours = records.reduce((sum, r) => sum + r.otHours, 0);

    const rate = Number(emp.dailyRate);
    const allowance = Number(emp.allowancePerDay);

    const normalPay = workDays * rate;
    const otPay = otHours * (rate / 8) * 1.5;
    const allowancePay = workDays * allowance;

    const total = normalPay + otPay + allowancePay;

    await prisma.payrollItem.create({
      data: {
        employeeId: emp.id,
        payrollPeriodId: payroll.id,

        normalHours,
        otHours,
        workDays,

        normalPay: new Prisma.Decimal(normalPay),
        otPay: new Prisma.Decimal(otPay),
        allowance: new Prisma.Decimal(allowancePay),
        totalPay: new Prisma.Decimal(total),
      },
    });
  }

  // --------------------
  // REPORT
  // --------------------

  const empCount = await prisma.employee.count();
  const attCount = await prisma.attendance.count();
  const payrollCount = await prisma.payrollItem.count();

  console.log('\n📊 SEED REPORT');
  console.log('----------------');
  console.log('Employees:', empCount);
  console.log('Attendances:', attCount);
  console.log('Payroll Items:', payrollCount);

  console.log('\n✅ Seed finished');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
